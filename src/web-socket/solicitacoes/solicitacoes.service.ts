import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Prisma, StatusSolicitacao } from '@/generated/prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import { TYPES_NOTICES } from '@/utils/types-notices.cosnt';
import type { PaginatedResponse } from '@/interfaces/paginator.interface';
import { CreateSolicitacoesDto } from './dto/create-solicitacoes.dto';
import { QuerySolicitacoesFilterDto } from './dto/query-solicitacoes.dto';
import type { SolicitacoesListagem } from './entities/solicitacoes.entity';
import { ResponderSolicitacoesDto } from './dto/response-solicitacoes.dto';
import {
  AcaoSolicitacao,
  AtorSolicitacao,
  ContadorSolicitacoes,
  ehPerfilReceptor,
  INCLUDE_RELACOES,
  LIMITE_LISTA_COMPLETA,
  LIMITE_PENDENTES,
  REGRAS,
  toAssembleQuery,
} from './entities/query-solicitacoes.const';

/**
 * Payload do push.
 * `origemSupervisor` é derivado do perfil de quem abriu a solicitação:
 * é o que permite ao terminal distinguir "nova solicitação do supervisor"
 * de "solicitação do próprio posto".
 */
export interface SolicitacaoEvento {
  solicitacao: SolicitacoesListagem & { origemSupervisor?: boolean };
  acao: 'CRIADA' | AcaoSolicitacao | 'VISUALIZADA';
}

/** Tag de ativo disponível para o operador, com o gestor que a responde. */
export interface TagAtivoDisponivel {
  id: string;
  codigo: string | null;
  descricao: string | null;
  estado: string | null;
  setorId: string | null;
  setorDescricao: string | null;
  solicitadoId: string;
  solicitadoNome: string | null;
}

/** Teto do `size` — espelha o @Max(100) do DTO, mas vale mesmo sem o pipe. */
const TAMANHO_MAXIMO = 100;
const TAMANHO_PADRAO = 10;

@Injectable()
export class SolicitacoesService {
  private readonly logger = new Logger(SolicitacoesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /* ==================== NORMALIZAÇÃO DE ID ==================== */

  private extrairId(valor: unknown): string {
    if (typeof valor === 'string' && valor.trim()) return valor.trim();

    if (valor && typeof valor === 'object' && !Array.isArray(valor)) {
      const id = (valor as { id?: unknown }).id;
      if (typeof id === 'string' && id.trim()) return id.trim();
    }

    throw new BadRequestException('Identificador da solicitação inválido');
  }

  /* ==================== ORIGEM ==================== */

  /**
   * Quem abriu a solicitação tem perfil receptor (supervisor/gestão)?
   * Uma única query, cacheada por chamada — é o que o terminal usa para
   * exibir "o supervisor enviou uma nova mensagem" em vez de texto genérico.
   */
  private async ehOrigemSupervisor(
    solicitanteId?: string | null,
  ): Promise<boolean> {
    if (!solicitanteId) return false;

    try {
      const usuario = await this.prisma.client.usuario.findUnique({
        where: { id: solicitanteId },
        select: {
          perfil: {
            select: { id: true, descricao: true, nivel: true, status: true },
          },
        },
      });

      const perfil = usuario?.perfil;
      if (!perfil || perfil.status === false) return false;

      return ehPerfilReceptor(perfil);
    } catch (erro) {
      this.logger.warn(
        `Não foi possível resolver o perfil de ${solicitanteId}: ${String(erro)}`,
      );
      return false;
    }
  }

  /* ==================== ESCRITA ==================== */

  async create(dto: CreateSolicitacoesDto): Promise<SolicitacoesListagem> {
    try {
      if (dto.tipoSolicitacaoId) {
        const tipo = await this.prisma.client.tipoSolicitacao.findUnique({
          where: { id: dto.tipoSolicitacaoId },
          select: { id: true, status: true },
        });

        if (!tipo || tipo.status !== true) {
          throw new NotFoundException(
            `${TYPES_NOTICES.NOT_FOUND} - TipoSolicitacao`,
          );
        }
      }

      const solicitado = await this.prisma.client.usuario.findUnique({
        where: { id: dto.solicitadoId },
        select: {
          id: true,
          status: true,
          perfil: {
            select: { id: true, descricao: true, nivel: true, status: true },
          },
        },
      });

      if (!solicitado || solicitado.status !== true) {
        throw new NotFoundException(`${TYPES_NOTICES.NOT_FOUND} - Solicitado`);
      }

      const perfil = solicitado.perfil;

      if (!perfil || perfil.status !== true) {
        throw new BadRequestException(
          'Solicitado não possui perfil ativo para receber solicitações',
        );
      }

      if (!ehPerfilReceptor(perfil)) {
        throw new BadRequestException(
          `Solicitado não possui perfil para receber solicitações ` +
            `(perfil atual: ${perfil.descricao} — ${perfil.nivel})`,
        );
      }

      const pendentes = await this.prisma.client.solicitacoes.count({
        where: {
          solicitanteId: dto.solicitanteId ?? null,
          solicitadoId: dto.solicitadoId,
          situacao: StatusSolicitacao.PENDENTE,
          status: true,
        },
      });

      if (pendentes >= LIMITE_PENDENTES) {
        throw new ConflictException(
          `Limite de ${LIMITE_PENDENTES} solicitações pendentes para este solicitado`,
        );
      }

      const criada = await this.prisma.client.solicitacoes.create({
        data: {
          solicitanteId: dto.solicitanteId,
          solicitadoId: dto.solicitadoId,
          tipoSolicitacaoId: dto.tipoSolicitacaoId,
          tagAtivoId: dto.tagAtivoId,
          observacao: dto.observacao,
          situacao: StatusSolicitacao.PENDENTE,
          dataEnvio: new Date(),
          status: true,
        },
        include: INCLUDE_RELACOES,
      });

      const origemSupervisor = await this.ehOrigemSupervisor(dto.solicitanteId);

      this.eventEmitter.emit('solicitacao.alterada', {
        solicitacao: { ...criada, origemSupervisor },
        acao: 'CRIADA',
      } as SolicitacaoEvento);

      this.logger.log(
        `Solicitação ${criada.id} criada por ${dto.solicitanteId ?? 'sistema'} ` +
          `para ${dto.solicitadoId} (origem supervisor: ${origemSupervisor})`,
      );

      return criada;
    } catch (error) {
      this.logger.error(`${TYPES_NOTICES.SERVICE_FAILURE} - create()`, error);
      throw error;
    }
  }

  private async aplicarAcao(
    usuarioId: string,
    solicitacaoId: string,
    acao: AcaoSolicitacao,
    observacao?: string,
  ): Promise<SolicitacoesListagem> {
    const regra = REGRAS[acao];
    if (!regra) throw new BadRequestException('Ação inválida');

    const id = this.extrairId(solicitacaoId);

    const atual = await this.prisma.client.solicitacoes.findUnique({
      where: { id },
      select: {
        id: true,
        situacao: true,
        solicitanteId: true,
        solicitadoId: true,
        observacao: true,
        status: true,
      },
    });

    if (!atual || atual.status !== true) {
      throw new NotFoundException(`${TYPES_NOTICES.NOT_FOUND} - Solicitação`);
    }

    this.validarAtor(atual, usuarioId, regra.ator);

    if (!regra.de.includes(atual.situacao)) {
      throw new ConflictException(
        `Não é possível ${acao} uma solicitação com situação ${atual.situacao}`,
      );
    }

    const alterados = await this.prisma.client.solicitacoes.updateMany({
      where: {
        id,
        situacao: { in: regra.de },
        status: true,
      },
      data: {
        situacao: regra.para,
        dataResposta: new Date(),
        ...(observacao && {
          observacao: atual.observacao
            ? `${atual.observacao}\n${observacao}`
            : observacao,
        }),
      },
    });

    if (alterados.count === 0) {
      throw new ConflictException(
        'Solicitação já foi alterada por outro dispositivo',
      );
    }

    const atualizada = await this.prisma.client.solicitacoes.findUniqueOrThrow({
      where: { id },
      include: INCLUDE_RELACOES,
    });

    const origemSupervisor = await this.ehOrigemSupervisor(
      atualizada.solicitanteId,
    );

    this.eventEmitter.emit('solicitacao.alterada', {
      solicitacao: { ...atualizada, origemSupervisor },
      acao,
    } as SolicitacaoEvento);

    this.logger.log(`Solicitação ${id} -> ${regra.para} por ${usuarioId}`);

    return atualizada;
  }

  responder(usuarioId: string, dto: ResponderSolicitacoesDto) {
    return this.aplicarAcao(usuarioId, dto.id, dto.acao, dto.observacao);
  }

  cancelar(usuarioId: string, id: string) {
    return this.aplicarAcao(usuarioId, id, 'CANCELAR');
  }

  reabrir(usuarioId: string, id: string) {
    return this.aplicarAcao(usuarioId, id, 'REABRIR');
  }

  private validarAtor(
    solicitacao: { solicitanteId: string | null; solicitadoId: string },
    usuarioId: string,
    ator: AtorSolicitacao,
  ): void {
    if (ator === 'GESTAO') return;

    const ehSolicitante = solicitacao.solicitanteId === usuarioId;
    const ehSolicitado = solicitacao.solicitadoId === usuarioId;

    if (ator === 'SOLICITANTE' && !ehSolicitante) {
      throw new ForbiddenException(
        'Apenas o solicitante pode executar esta ação',
      );
    }

    if (ator === 'SOLICITADO' && !ehSolicitado) {
      throw new ForbiddenException(
        'Apenas o solicitado pode executar esta ação',
      );
    }
  }

  /* ==================== LEITURA AUXILIAR ==================== */

  /**
   * Com `tagAtivoId`, o escopo é o posto inteiro: é o que o terminal precisa,
   * porque ele não é o solicitante nem o solicitado gravado na linha.
   */
  async contar(
    usuarioId: string,
    tagAtivoId?: string,
  ): Promise<ContadorSolicitacoes> {
    const alvo = this.extrairId(usuarioId);
    const tag = tagAtivoId?.trim() || null;

    const whereRecebidas = tag
      ? { tagAtivoId: tag, status: true }
      : { solicitadoId: alvo, status: true };

    const whereEnviadas = tag
      ? { tagAtivoId: tag, status: true }
      : { solicitanteId: alvo, status: true };

    const [recebidas, enviadas, naoVisualizadas] = await Promise.all([
      this.prisma.client.solicitacoes.groupBy({
        by: ['situacao'],
        where: whereRecebidas,
        _count: { _all: true },
      }),
      this.prisma.client.solicitacoes.groupBy({
        by: ['situacao'],
        where: whereEnviadas,
        _count: { _all: true },
      }),
      this.prisma.client.solicitacoes.count({
        where: {
          ...whereRecebidas,
          situacao: StatusSolicitacao.PENDENTE,
          dataVisualizacao: null,
        },
      }),
    ]);

    const montar = (
      grupos: { situacao: StatusSolicitacao; _count: { _all: number } }[],
    ) => {
      const mapa = new Map(grupos.map((g) => [g.situacao, g._count._all]));
      const pegar = (s: StatusSolicitacao) => mapa.get(s) ?? 0;

      return {
        pendentes: pegar(StatusSolicitacao.PENDENTE),
        aceitas: pegar(StatusSolicitacao.ACEITA),
        recusadas: pegar(StatusSolicitacao.RECUSADA),
        canceladas: pegar(StatusSolicitacao.CANCELADA),
      };
    };

    return {
      recebidas: montar(recebidas),
      enviadas: montar(enviadas),
      naoVisualizadas,
    };
  }

  async marcarVisualizada(
    usuarioId: string,
    ids: string[],
    tagAtivoId?: string,
  ): Promise<{ marcadas: number }> {
    if (!Array.isArray(ids) || ids.length === 0) return { marcadas: 0 };

    const normalizados = ids
      .map((item) => {
        try {
          return this.extrairId(item);
        } catch {
          return null;
        }
      })
      .filter((item): item is string => !!item);

    if (normalizados.length === 0) return { marcadas: 0 };

    const alvo = this.extrairId(usuarioId);
    const tag = tagAtivoId?.trim() || null;

    /* Com tag, o dono da linha é o posto — não o usuarioId do terminal. */
    const escopo = tag ? { tagAtivoId: tag } : { solicitadoId: alvo };

    const { count } = await this.prisma.client.solicitacoes.updateMany({
      where: {
        id: { in: normalizados },
        ...escopo,
        dataVisualizacao: null,
        status: true,
      },
      data: { dataVisualizacao: new Date() },
    });

    if (count > 0) {
      const atualizadas = await this.prisma.client.solicitacoes.findMany({
        where: { id: { in: normalizados }, ...escopo },
        include: INCLUDE_RELACOES,
      });

      for (const solicitacao of atualizadas) {
        this.eventEmitter.emit('solicitacao.alterada', {
          solicitacao,
          acao: 'VISUALIZADA',
        } as SolicitacaoEvento);
      }
    }

    return { marcadas: count };
  }

  /* ==================== LEITURA ==================== */

  private normalizarPaginacao(query: QuerySolicitacoesFilterDto): {
    pagina: number;
    tamanho: number;
  } {
    const pagina = Math.max(1, Math.trunc(Number(query.page) || 1));
    const tamanho = Math.min(
      TAMANHO_MAXIMO,
      Math.max(1, Math.trunc(Number(query.size) || TAMANHO_PADRAO)),
    );

    return { pagina, tamanho };
  }

  async findAllPagination(
    query: QuerySolicitacoesFilterDto,
    tx?: Prisma.TransactionClient,
  ): Promise<PaginatedResponse<SolicitacoesListagem>> {
    try {
      const client = tx ?? this.prisma.client;
      const { pagina, tamanho } = this.normalizarPaginacao(query);
      const base = toAssembleQuery(query);

      const [listar, total] = await client.$transaction([
        client.solicitacoes.findMany({
          ...base,
          skip: (pagina - 1) * tamanho,
          take: tamanho,
        }),
        client.solicitacoes.count({ where: base.where }),
      ]);

      if (listar.length === 0) {
        this.logger.warn(TYPES_NOTICES.EMPTY_LIST);
      }

      this.logger.log(TYPES_NOTICES.FIND_ALL);

      return {
        dados: listar as SolicitacoesListagem[],
        total,
        pagina,
        tamanho,
      };
    } catch (error) {
      this.logger.error(
        TYPES_NOTICES.SERVICE_FAILURE,
        ' - findAllPagination()',
      );
      throw error;
    }
  }

  async findAllList(
    query: QuerySolicitacoesFilterDto,
    tx?: Prisma.TransactionClient,
  ): Promise<SolicitacoesListagem[]> {
    try {
      const client = tx ?? this.prisma.client;

      const listar = await client.solicitacoes.findMany({
        ...toAssembleQuery(query),
        take: LIMITE_LISTA_COMPLETA,
      });

      if (listar.length === 0) {
        this.logger.warn(TYPES_NOTICES.EMPTY_LIST);
      }

      this.logger.log(TYPES_NOTICES.FIND_ALL);

      return listar as SolicitacoesListagem[];
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - findAllList()');
      throw error;
    }
  }

  async findOneFirst(
    query: QuerySolicitacoesFilterDto,
    tx?: Prisma.TransactionClient,
  ): Promise<SolicitacoesListagem | null> {
    try {
      const client = tx ?? this.prisma.client;

      const buscar = await client.solicitacoes.findFirst(
        toAssembleQuery(query),
      );

      if (!buscar) {
        this.logger.warn(TYPES_NOTICES.NOT_FOUND);
      }

      return buscar as SolicitacoesListagem | null;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - findOneFirst()');
      throw error;
    }
  }

  async findOne(
    id: string,
    tx?: Prisma.TransactionClient,
  ): Promise<SolicitacoesListagem> {
    try {
      const client = tx ?? this.prisma.client;
      const alvo = this.extrairId(id);

      const buscar = await client.solicitacoes.findUnique({
        where: { id: alvo },
        include: INCLUDE_RELACOES,
      });

      if (!buscar) {
        this.logger.warn(TYPES_NOTICES.NOT_FOUND);
        throw new NotFoundException(TYPES_NOTICES.NOT_FOUND);
      }

      return buscar;
    } catch (error) {
      this.logger.log(TYPES_NOTICES.SERVICE_FAILURE, ' - findOne()');
      throw error;
    }
  }

  /**
   * Tags de ativo que o usuário pode solicitar, com o gestor responsável.
   */
  async listarTagsAtivoAlocadas(
    usuarioId: string,
  ): Promise<TagAtivoDisponivel[]> {
    const alvo = this.extrairId(usuarioId);

    try {
      const competencias =
        await this.prisma.client.competenciaSetorial.findMany({
          where: {
            status: true,
            OR: [{ colaboradorId: alvo }, { gestorId: alvo }],
          },
          select: { setorId: true, gestorId: true, colaboradorId: true },
        });

      const gestorPorSetor = new Map<string, string>();

      for (const competencia of competencias) {
        if (!competencia.setorId) continue;

        const atual = gestorPorSetor.get(competencia.setorId);

        if (!atual || competencia.colaboradorId === alvo) {
          gestorPorSetor.set(competencia.setorId, competencia.gestorId);
        }
      }

      const setorIds = [...gestorPorSetor.keys()];

      if (!setorIds.length) {
        this.logger.warn(
          `Usuário ${alvo} sem competência setorial ativa — nenhum ativo disponível`,
        );
        return [];
      }

      const tags = await this.prisma.client.tagAtivo.findMany({
        where: { ativo: { setorId: { in: setorIds } } },
        select: {
          id: true,
          codigo: true,
          descricao: true,
          ativoId: true,
          ativo: { select: { id: true, setorId: true } },
        },
        orderBy: { descricao: 'asc' },
      });

      if (!tags.length) {
        this.logger.warn(
          `Nenhuma tag de ativo nos setores ${setorIds.join(', ')}`,
        );
        return [];
      }

      const nomeSetor = await this.descricaoDosSetores(setorIds);

      const montadas: Omit<TagAtivoDisponivel, 'solicitadoNome'>[] = [];

      for (const tag of tags) {
        const setorId = tag.ativo?.setorId ?? null;
        const solicitadoId = setorId ? gestorPorSetor.get(setorId) : undefined;

        if (!solicitadoId) continue;
        if (solicitadoId === alvo) continue;

        montadas.push({
          id: tag.id,
          codigo: tag.codigo !== null ? String(tag.codigo) : null,
          descricao: tag.descricao ?? null,
          estado: null,
          setorId,
          setorDescricao: setorId ? nomeSetor.get(setorId) ?? null : null,
          solicitadoId,
        });
      }

      if (!montadas.length) {
        this.logger.warn(
          `Nenhuma tag com gestor resolvido para o usuário ${alvo}`,
        );
        return [];
      }

      const gestorIds = [...new Set(montadas.map((item) => item.solicitadoId))];

      const gestores = await this.prisma.client.usuario.findMany({
        where: { id: { in: gestorIds } },
        select: { id: true, nome: true },
      });

      const nomePorGestor = new Map<string, string | null>();
      for (const gestor of gestores) {
        nomePorGestor.set(gestor.id, gestor.nome ?? null);
      }

      return montadas.map((item) => ({
        ...item,
        solicitadoNome: nomePorGestor.get(item.solicitadoId) ?? null,
      }));
    } catch (error) {
      this.logger.error(
        `${TYPES_NOTICES.SERVICE_FAILURE} - listarTagsAtivoAlocadas()`,
        error,
      );
      throw error;
    }
  }

  /** Descrição dos setores. Falha aqui não derruba a lista de ativos. */
  private async descricaoDosSetores(
    setorIds: string[],
  ): Promise<Map<string, string | null>> {
    const mapa = new Map<string, string | null>();

    try {
      const setores = await this.prisma.setores.findMany({
        where: { id: { in: setorIds } },
        select: { id: true, descricao: true },
      });

      for (const setor of setores) {
        mapa.set(setor.id, setor.descricao ?? null);
      }
    } catch (error) {
      this.logger.warn(
        `Não foi possível carregar a descrição dos setores: ${String(error)}`,
      );
    }

    return mapa;
  }

  async listarTipos() {
    return this.prisma.client.tipoSolicitacao.findMany({
      where: { status: true },
      orderBy: { descricao: 'asc' },
    });
  }
}
