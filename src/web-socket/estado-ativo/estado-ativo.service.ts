import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  CondicaoAlocacao,
  CondicaoOcorrencia,
  Prisma,
  SituacaoAlocacao,
  TipoEstadoAtivo,
  TipoTurno,
} from '@/generated/prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import { TenantContextService } from '@/auth/tenant-context/tenant-context.service';
import { GeradorTurnoService } from '@/modules/gerador-turno/gerador-turno.service';
import { AlocacaoService } from '@/modules/alocacao/alocacao.service';
import { TagAtivoService } from '@/modules/tag-ativo/tag-ativo.service';
import { TYPES_NOTICES } from '@/utils/types-notices.cosnt';
import { CreateEstadoAtivoDto } from './dto/create-estado-ativo.dto';
import { UpdateEstadoAtivoDto } from './dto/update-estado-ativo.dto';
import { QueryEstadoAtivoFilterDto } from './dto/query-estado-ativo.dto';
import type {
  EstadoAtivo,
  EstadoAtivoListagem,
  EstadoAtivoRelacao,
} from './entities/estado-ativo.entity';
import type { PaginatedResponse } from '@/interfaces/paginator.interface';
import type { AuthUser } from '@/auth/entities/auth-user.interface';
import { QueryAlocacaoOperacionalFilterDto } from '@/modules/alocacao/dto/query-alocacao.dto';
import { OcorrenciaService } from '@/modules/ocorrencia/ocorrencia.service';
import { QueryOcorrenciaFilterDto } from '@/modules/ocorrencia/dto/query-ocorrencia.dto';
import { QueryTagAtivoFilterDto } from '@/modules/tag-ativo/dto/query-tag-ativo.dto';
import { CreateOcorrenciaDto } from '@/modules/ocorrencia/dto/create-ocorrencia.dto';

/** Troca de estado: o anterior (se houver) e o atual, emitidos após o commit */
export interface EstadoTrocadoEvent {
  ativo: string; // tagAtivoId
  anterior: EstadoAtivo | null;
  atual: EstadoAtivo;
}

/** Tempo decorrido calculado no servidor, emitido a cada segundo */
export interface CronometroTickEvent {
  ativo: string; // tagAtivoId
  id: string;
  tipoEstado: string;
  tempo: number;
}

const INTERVALO_TICK_MS = 1000;
const DTO = {
  OCORRENCIA_QUERY_A: (
    tagAtivo: string,
    dataInicil: Date,
  ): QueryOcorrenciaFilterDto => ({
    tagAtivoId: tagAtivo,
    dataInicial: dataInicil,
    condicaoOcorrencia: CondicaoOcorrencia.EXECUCAO,
    status: true,
  }),
  TAGATIVO_QUERY_A: (tagAtivo: string): QueryTagAtivoFilterDto => ({
    descricao: tagAtivo,
    status: true,
  }),
  ALOCACAO_QUERY_A: (
    turno: TipoTurno,
    tagAtivo: string,
  ): QueryAlocacaoOperacionalFilterDto => ({
    turno: turno,
    tagAtivoId: tagAtivo,
    condicao: CondicaoAlocacao.ACEITO,
    situacao: SituacaoAlocacao.ALOCADO,
    status: true,
    incluir: 'todos_relacoes',
  }),
  OCORRENCIA_CREATE_A: (estado: string): CreateOcorrenciaDto => ({
    estadoAtivoId: estado,
  }),
};

@Injectable()
export class EstadoAtivoService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger();

  /** Um timer por ativo, em memória. Chave: tagAtivoId */
  private readonly contadores = new Map<string, NodeJS.Timeout>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContextService,
    private readonly tagAtivoService: TagAtivoService,
    private readonly geradorTurnoService: GeradorTurnoService,
    private readonly alocOperService: AlocacaoService,
    private readonly ocorrenciaService: OcorrenciaService,
    private eventEmitter: EventEmitter2,
  ) {}

  /* ==================== CICLO DE VIDA DOS CONTADORES ==================== */

  /** Ao subir o servidor, retoma os contadores dos estados ainda abertos */
  async onModuleInit(): Promise<void> {
    await this.reiniciarContadores();
  }

  onModuleDestroy(): void {
    for (const tagAtivoId of [...this.contadores.keys()]) {
      this.pararContador(tagAtivoId);
    }
  }

  /** Retoma os contadores: só o estado mais recente de cada ativo recebe timer */
  async reiniciarContadores(): Promise<void> {
    const abertos = await this.prisma.client.estadoAtivo.findMany({
      where: { status: true },
      orderBy: { dataInicial: 'desc' },
    });

    const jaIniciados = new Set<string>();
    for (const estado of abertos) {
      if (jaIniciados.has(estado.tagAtivoId)) {
        this.logger.warn(
          `Ativo ${estado.tagAtivoId} com mais de um estado aberto (id ${estado.id})`,
        );
        continue;
      }
      jaIniciados.add(estado.tagAtivoId);
      this.iniciarContador(estado);
    }

    this.logger.log(`${jaIniciados.size} contador(es) reiniciado(s)`);
  }

  /** Método público chamado pelo gateway (reiniciarContadorEstado) */
  async reiniciarContador(): Promise<{ mensagem: string }> {
    await this.reiniciarContadores();
    const mensagem = 'Contadores iniciados novamente!';
    this.logger.log(mensagem);
    return { mensagem };
  }

  /**
   * Inicia (ou reinicia) o contador do ativo. O timer anterior é parado antes,
   * para nunca existirem dois timers do mesmo ativo. Não consulta o banco a
   * cada tick: o tempo é calculado a partir de dataInicial em memória.
   */
  iniciarContador(estado: EstadoAtivo): void {
    this.pararContador(estado.tagAtivoId);

    // Normaliza a comparação: cobre enum numérico, string e diferença de case
    const tiposValidos = Object.values(TipoEstadoAtivo).map((v) =>
      String(v).toUpperCase(),
    );
    const tipoEstado = String(estado.tipoEstado).toUpperCase();

    if (!tiposValidos.includes(tipoEstado)) {
      this.logger.warn(
        `TipoEstado ${tipoEstado} sem contador (ativo ${estado.tagAtivoId})`,
      );
      return;
    }

    const inicio = estado.dataInicial.getTime();
    const intervalo = setInterval(() => {
      const tick: CronometroTickEvent = {
        ativo: estado.tagAtivoId,
        id: estado.id,
        tipoEstado,
        tempo: Math.floor((Date.now() - inicio) / 1000),
      };
      this.eventEmitter.emit('cronometro.tick', tick);
    }, INTERVALO_TICK_MS);

    this.contadores.set(estado.tagAtivoId, intervalo);
    this.logger.log(
      `Contador iniciado: ativo ${estado.tagAtivoId} (${tipoEstado}, desde ${estado.dataInicial.toISOString()})`,
    );
  }

  /**
   * Encerra todos os estados abertos do ativo e devolve o mais recente encerrado.
   * Não mexe no timer: quem reinicia é o create, após o commit.
   */
  async finalizarContador(
    tagAtivoId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<EstadoAtivo | null> {
    this.logger.log(`Finalizando cronômetro: ${tagAtivoId}`);
    const client = tx ?? this.prisma;

    const abertos = await client.estadoAtivo.findMany({
      where: { tagAtivoId, status: true },
      orderBy: { dataInicial: 'desc' },
    });
    if (abertos.length === 0) return null;

    const agora = new Date();
    let ultimoFinalizado: EstadoAtivo | null = null;

    for (const aberto of abertos) {
      const duracao = Math.floor(
        (agora.getTime() - aberto.dataInicial.getTime()) / 1000,
      );
      const finalizado = await client.estadoAtivo.update({
        where: { id: aberto.id },
        data: { status: false, duracao, dataFinal: agora },
      });
      if (!ultimoFinalizado) ultimoFinalizado = finalizado;
    }

    return ultimoFinalizado;
  }

  /** Para o timer do ativo, se existir */
  pararContador(tagAtivoId: string): void {
    const intervalo = this.contadores.get(tagAtivoId);
    if (!intervalo) return;
    clearInterval(intervalo);
    this.contadores.delete(tagAtivoId);
  }

  /**
   * Garante que o timer do ativo está rodando a partir do estado ABERTO atual.
   * Chame no handleConnection do gateway: cobre restart do servidor,
   * estado criado fora do fluxo e reconexão do dispositivo.
   */
  async garantirContadorDoAtivo(
    tagAtivoId: string | null,
  ): Promise<EstadoAtivo | null> {
    if (!tagAtivoId) return null; // nunca consulta com null
    const estado = await this.buscarEstadoAtivoCliente(tagAtivoId);
    if (!estado) return null;
    this.iniciarContador(estado);
    return estado;
  }

  /* ==================== CONSULTAS DE APOIO ==================== */

  /**
   * Resolve o tagAtivoId do usuário no banco. Cada dispositivo tem seu próprio
   * token, mas o tagAtivoId é compartilhado entre terminal e dispositivo.
   */
  async buscarTagAtivoDoUsuario(userId: string): Promise<string | null> {
    const usuario = await this.prisma.client.usuario.findUnique({
      where: { id: userId },
      select: { tagAtivoId: true },
    });
    return usuario?.tagAtivoId ?? null;
  }

  /* ==================== CREATE ==================== */

  async create(create: CreateEstadoAtivoDto) {
    try {
      const criarEstado = await this.prisma.client.$transaction(
        async (tx: Prisma.TransactionClient) => {
          const { tipoEstado, tagAtivo } = create;
          this.logger.debug(`Ativo ${tagAtivo} cadastrando estado...`);

          // Tag-Ativo: resolve a descrição enviada pelo dispositivo no id
          const queryT = DTO.TAGATIVO_QUERY_A(tagAtivo!);
          const tagAtivoAtual = await this.tagAtivoService.findOneQuery(
            queryT,
            tx,
          );
          if (!tagAtivoAtual) {
            this.logger.warn(`${TYPES_NOTICES.NOT_FOUND} - TagAtivoAtual`);
            throw new NotFoundException(
              `${TYPES_NOTICES.NOT_FOUND} - TagAtivoAtual`,
            );
          }
          const { id } = tagAtivoAtual;
          this.logger.debug(id);

          //Ocorrencia: consulta
          const dataAtual = new Date();
          const queryO = DTO.OCORRENCIA_QUERY_A(id, dataAtual);
          const ocorrencia = await this.ocorrenciaService.findOneFirst(
            queryO,
            tx,
          );
          if (ocorrencia) {
            this.logger.warn(TYPES_NOTICES.FIND_ONE);
            throw new ConflictException(
              `Tag Ativo id ${tagAtivo} possui ocorrência!`,
            );
          }

          /* ===== IDEMPOTÊNCIA: estado igual já aberto não é recriado =====
           * O dispositivo pode reenviar o estado ao reconectar (ou reagir ao
           * próprio eco de 'estadoAtivoTrocado'). Sem este guard, cada reenvio
           * fechava o estado atual e criava outro idêntico, zerando o tempo. */
          const estadoAberto = await tx.estadoAtivo.findFirst({
            where: { tagAtivoId: id, status: true },
            orderBy: { dataInicial: 'desc' },
          });
          if (estadoAberto && estadoAberto.tipoEstado === tipoEstado) {
            this.logger.log(
              `Estado ${tipoEstado} já aberto no ativo ${id}; reenvio ignorado.`,
            );
            return {
              cronometroFinalizado: null,
              cronometroNovo: estadoAberto,
              repetido: true as const,
            };
          }

          // Finaliza o estado anterior do mesmo ativo, na mesma transação
          const cronometroFinalizado = await this.finalizarContador(id, tx);

          // Alocação-Operacional: fornece o alocacaoId gravado no estado
          const turnoAtual = await this.geradorTurnoService.getTurnoAtual();
          const queryA = DTO.ALOCACAO_QUERY_A(turnoAtual.turno, id!);
          const alocacaoAtual = await this.alocOperService.findOneAllocation(
            queryA,
            tx,
          );
          if (!alocacaoAtual) {
            this.logger.warn(`${TYPES_NOTICES.NOT_FOUND} - AlocaçãoAtual`);
            throw new NotFoundException(
              `${TYPES_NOTICES.NOT_FOUND} - AlocaçãoAtual`,
            );
          }

          // Cria o novo estado
          const cronometroNovo = await tx.estadoAtivo.create({
            data: {
              tagAtivoId: id,
              alocacaoId: alocacaoAtual.id,
              tipoEstado,
            },
          });
          // Cria uma nova ocorrencia
          if (cronometroNovo.tipoEstado === TipoEstadoAtivo.FALHA) {
            const createO = DTO.OCORRENCIA_CREATE_A(cronometroNovo.id);
            await this.ocorrenciaService.create(createO, tx);
          }

          return {
            cronometroFinalizado,
            cronometroNovo,
            repetido: false as const,
          };
        },
      );

      // O timer sempre é garantido (pararContador antes evita timer duplo),
      // inclusive no caso de reenvio após um restart do servidor.
      this.iniciarContador(criarEstado.cronometroNovo);

      // Só emite a troca quando um estado NOVO foi de fato gravado.
      // No reenvio, nada muda para os clientes: sem evento, sem loop.
      if (!criarEstado.repetido) {
        const payload: EstadoTrocadoEvent = {
          ativo: criarEstado.cronometroNovo.tagAtivoId,
          anterior: criarEstado.cronometroFinalizado,
          atual: criarEstado.cronometroNovo,
        };
        this.eventEmitter.emit('estado.trocado', payload);
        this.logger.log(
          `Estado ${create.tipoEstado} registrado no ativo ${payload.ativo}`,
        );
      }

      return criarEstado;
    } catch (error) {
      this.logger.error(`${TYPES_NOTICES.SERVICE_FAILURE} - create()`, error);
      throw error;
    }
  }

  /* ==================== CONSULTAS DE ESTADO ==================== */

  /** Estado aberto do ativo (usado ao conectar e reconectar) */
  async buscarEstadoAtivoCliente(
    tagAtivoId: string,
  ): Promise<EstadoAtivo | null> {
    const estado = await this.prisma.client.estadoAtivo.findFirst({
      where: { tagAtivoId, status: true },
      orderBy: { dataInicial: 'desc' },
    });
    return estado ?? null;
  }

  /** Lista todos os estados abertos (com relações parciais) */
  async listarEstadoAtivos(): Promise<EstadoAtivoListagem[]> {
    const lista = await this.prisma.client.estadoAtivo.findMany({
      where: { status: true },
      orderBy: [{ tagAtivo: { descricao: 'asc' } }],
      include: await this.toAssembleInclude('todos_parcial'),
    });
    if (lista.length === 0) {
      this.logger.warn(TYPES_NOTICES.EMPTY_LIST);
    }
    return lista;
  }

  /* ==================== HISTÓRICO DO DIA/TURNOS ==================== */

  /**
   * Histórico do dia atual no turno atual: apenas estados já finalizados.
   * O turno é resolvido pela alocação gravada no estado (alocacaoOperacional.turno),
   * então um estado iniciado no turno anterior e finalizado neste não aparece aqui.
   */
  async historicoDoDiaAtual(
    tagAtivoId?: string,
  ): Promise<EstadoAtivoListagem[]> {
    const turnoAtual = await this.geradorTurnoService.getTurnoAtual();
    const inicio = new Date();
    inicio.setHours(0, 0, 0, 0);
    const fim = new Date();
    fim.setHours(23, 59, 59, 999);

    const condicao: Prisma.EstadoAtivoWhereInput = {
      status: false,
      dataFinal: { gte: inicio, lte: fim },
      alocacaoOperacional: { turno: turnoAtual.turno },
    };
    if (tagAtivoId) condicao.tagAtivoId = tagAtivoId;

    const historico = await this.prisma.client.estadoAtivo.findMany({
      where: condicao,
      orderBy: { dataFinal: 'desc' },
      include: await this.toAssembleInclude('todos_parcial'),
    });

    if (historico.length === 0) {
      this.logger.log('Histórico do dia/turno vazio');
    }
    return historico;
  }

  /* FUNÇÃO DE SELEÇÃO DE CAMPOS */
  private readonly allowedEstadoAtivoFields = [
    'id',
    'codigo',
    'alocacaoId',
    'tagAtivoId',
    'tipoEstado',
    'dataInicial',
    'dataFinal',
    'duracao',
    'status',
  ];
  private async buildSelect(
    campos?: string,
  ): Promise<Record<string, true> | undefined> {
    if (!campos) return undefined;

    const campoArray = campos.split(',').map((c) => c.trim());
    const selecaoObj: Record<string, true> = {};

    for (const campo of campoArray) {
      if (this.allowedEstadoAtivoFields.includes(campo)) {
        selecaoObj[campo] = true;
      }
    }

    return Object.keys(selecaoObj).length > 0 ? selecaoObj : undefined;
  }
  /* FUNÇÃO MONTAGEM DE CONDIÇÃO */
  private async toAssembleCondicao(
    filtros: Omit<
      QueryEstadoAtivoFilterDto,
      | 'perfilId'
      | 'page'
      | 'size'
      | 'campos'
      | 'incluir'
      | 'ordenacao'
      | 'decisao'
    >,
    usuarioId: string,
  ): Promise<Prisma.EstadoAtivoWhereInput> {
    const condicao: Prisma.EstadoAtivoWhereInput = {};

    if (filtros.codigo) condicao.codigo = filtros.codigo;
    if (filtros.alocacaoId) condicao.alocacaoId = filtros.alocacaoId;
    if (filtros.tagAtivoId) condicao.tagAtivoId = filtros.tagAtivoId;
    if (filtros.tipoEstado) condicao.tipoEstado = filtros.tipoEstado;
    if (filtros.dataInicial) condicao.dataInicial = filtros.dataInicial;
    if (filtros.dataFinal) condicao.dataFinal = filtros.dataFinal;
    if (filtros.status !== undefined) condicao.status = filtros.status;

    if (filtros.usuarioId)
      condicao.alocacaoOperacional = { gestorId: filtros.usuarioId };
    if (filtros.setorId)
      condicao.tagAtivo = { ativo: { setorId: filtros.setorId } };
    if (filtros.gestor) condicao.alocacaoOperacional = { gestorId: usuarioId };

    return condicao;
  }
  /* FUNÇÃO MONTAGEM DE ORDENAÇÃO */
  private async toAssembleOrderBy(
    ordenacao?: string,
  ): Promise<Prisma.EstadoAtivoOrderByWithRelationInput[]> {
    switch (ordenacao) {
      case 'filtrar':
        return [{ codigo: 'desc' }, { tipoEstado: 'asc' }];
      default:
        return [{ tagAtivo: { descricao: 'asc' } }];
    }
  }
  /* FUNÇÃO MONTAGEM DE INCLUDE */
  private async toAssembleInclude(
    incluir?: string,
  ): Promise<Prisma.EstadoAtivoInclude> {
    switch (incluir) {
      case 'todos_relacoes':
        return { tagAtivo: true, alocacaoOperacional: true };
      case 'todos_parcial':
        return {
          tagAtivo: {
            select: {
              id: true,
              codigo: true,
              descricao: true,
              ativo: {
                select: {
                  id: true,
                  descricao: true,
                  modelo: true,
                  setorId: true,
                },
              },
            },
          },
          alocacaoOperacional: {
            select: {
              operador: { select: { id: true, cracha: true, nome: true } },
              gestor: { select: { id: true, cracha: true, nome: true } },
            },
          },
        };
      default:
        return {
          tagAtivo: {
            select: {
              id: true,
              codigo: true,
              descricao: true,
              ativo: {
                select: {
                  id: true,
                  descricao: true,
                  modelo: true,
                  setorId: true,
                },
              },
            },
          },
          alocacaoOperacional: {
            select: {
              operador: { select: { id: true, cracha: true, nome: true } },
              gestor: { select: { id: true, cracha: true, nome: true } },
            },
          },
        };
    }
  }
  /* FUNÇÃO LISTAGEM */
  async findAll(
    query: QueryEstadoAtivoFilterDto,
    tx?: Prisma.TransactionClient,
  ): Promise<PaginatedResponse<EstadoAtivoListagem> | EstadoAtivoListagem[]> {
    try {
      const ctx = this.tenantContext.getStore()!;
      const client = tx ?? this.prisma.client;

      const {
        page = 1,
        size = 10,
        campos,
        incluir,
        ordenacao,
        ...filtros
      } = query;

      const condicao = await this.toAssembleCondicao(filtros, ctx.user);
      const selecao = await this.buildSelect(campos);

      let opcoes: Prisma.EstadoAtivoFindManyArgs = {};
      if (query.decisao === 'listar') {
        opcoes = {
          where: condicao,
          orderBy: await this.toAssembleOrderBy(ordenacao),
        };
      } else if (query.decisao === 'paginar') {
        opcoes = {
          where: condicao,
          orderBy: await this.toAssembleOrderBy(ordenacao),
          skip: (page - 1) * size,
          take: size,
        };
      }

      if (campos?.length) {
        opcoes.select = selecao;
      } else {
        opcoes.include = await this.toAssembleInclude(incluir);
      }

      const listar: EstadoAtivoListagem[] =
        await client.estadoAtivo.findMany(opcoes);

      if (listar.length === 0) {
        this.logger.warn(TYPES_NOTICES.EMPTY_LIST);
      }

      let retorno:
        | PaginatedResponse<EstadoAtivoListagem>
        | EstadoAtivoListagem[];
      if (query.decisao === 'paginar') {
        const total = await client.estadoAtivo.count({ where: condicao });
        retorno = { dados: listar, total, pagina: page, tamanho: size };
      } else {
        retorno = listar;
      }

      this.logger.log(TYPES_NOTICES.FIND_ALL);
      return retorno;
    } catch (error) {
      this.logger.log(TYPES_NOTICES.SERVICE_FAILURE, ' - findAll()');
      throw error;
    }
  }
  /**
   * Tempo acumulado por estado no dia/turno (em SEGUNDOS).
   * Base para o gráfico: proporção de tempo, não quantidade de ocorrências.
   */
  /**
   * Tempo acumulado por estado no dia/turno (em SEGUNDOS).
   * Base do gráfico: proporção de TEMPO, não quantidade de ocorrências.
   */
  /**
   * Tempo acumulado por estado no dia/turno (em SEGUNDOS).
   * Base do gráfico: proporção de TEMPO, não quantidade de ocorrências.
   */
  async counterEstados(tagAtivoId?: string): Promise<{
    total: number;
    produzindo: number;
    parado: number;
    falha: number;
  }> {
    const turnoAtual = await this.geradorTurnoService.getTurnoAtual();
    const inicio = new Date();
    inicio.setHours(0, 0, 0, 0);
    const fim = new Date();
    fim.setHours(23, 59, 59, 999);

    const condicao: Prisma.EstadoAtivoWhereInput = {
      status: false,
      dataFinal: { gte: inicio, lte: fim },
      alocacaoOperacional: { turno: turnoAtual.turno },
    };
    if (tagAtivoId) condicao.tagAtivoId = tagAtivoId;

    const grupos = await this.prisma.client.estadoAtivo.groupBy({
      by: ['tipoEstado'],
      where: condicao,
      _sum: { duracao: true },
    });

    // Variável intermediária evita o erro "_sum solto" e protege contra
    // Prisma devolver Decimal/string ou null
    const pegar = (tipo: string): number => {
      const grupo = grupos.find(
        (g) => String(g.tipoEstado).toUpperCase() === tipo,
      );
      return Number(grupo?._sum.duracao) || 0;
    };

    const total = grupos.reduce(
      (soma, g) => soma + (Number(g._sum.duracao) || 0),
      0,
    );

    this.logger.log(
      `Tempo por estado (s): total=${total} produzindo=${pegar('PRODUZINDO')} ` +
        `parada=${pegar('PARADA')} falha=${pegar('FALHA')}`,
    );

    return {
      total,
      produzindo: pegar('PRODUZINDO'),
      parado: pegar('PARADA'),
      falha: pegar('FALHA'),
    };
  }
  /* FUNÇÃO DE BUSCA POR ID */
  async findOne(
    id: string,
    tx?: Prisma.TransactionClient,
  ): Promise<EstadoAtivoRelacao> {
    try {
      const client = tx ?? this.prisma.client;

      const buscar = await client.estadoAtivo.findUnique({
        where: { id: id },
        include: {
          alocacaoOperacional: true,
          tagAtivo: true,
        },
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

  update(id: string, updateEstadoAtivoDto: UpdateEstadoAtivoDto) {
    return `This action updates a #${id} estadoAtivo`;
  }

  remove(id: string) {
    return `This action removes a #${id} estadoAtivo`;
  }
}
