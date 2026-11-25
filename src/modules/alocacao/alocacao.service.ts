import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UpdateAlocacaoDto } from './dto/update-alocacao.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { TenantContextService } from '@/auth/tenant-context/tenant-context.service';
import { TYPES_NOTICES } from '@/utils/types-notices.cosnt';
import {
  Acao,
  CondicaoAlocacao,
  Prisma,
  SituacaoAlocacao,
  TipoTurno,
} from '@/generated/prisma/client';
import {
  AlocacaoListagem,
  AlocacaoOperacional,
} from './entities/alocacao.entity';
import {
  QueryAlocacaoOperacionalCounterDto,
  QueryAlocacaoOperacionalFilterDto,
  QueryAlocacaoOperacionalSolicitacaoDto,
  QueryQuantidadeAlocacaoOperadorDto,
} from './dto/query-alocacao.dto';
import { QueryTagAtivoSetoresDto } from '../tag-ativo/dto/query-tag-ativo.dto';
import { TagAtivoService } from '../tag-ativo/tag-ativo.service';
import {
  ResponseAlertAlocacaoDto,
  ResponseAlocacaoContadorDto,
} from './dto/response-alocacao.dto';
import { PerfilService } from '../perfil/perfil.service';
import { ROLES } from '@/auth/guards/roles.const';
import { PaginatedResponse } from '@/interfaces/paginator.interface';

@Injectable()
export class AlocacaoService {
  private logger = new Logger(AlocacaoService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly perfilService: PerfilService,
    private readonly tagAtivoService: TagAtivoService,
    private readonly tenantContext: TenantContextService,
  ) {}

  async create(
    tagAtivoId: string,
    turno: TipoTurno,
    gestorId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<AlocacaoListagem> {
    try {
      const client = tx ?? this.prisma.client;

      const criar = await client.alocacaoOperacional.create({
        data: { tagAtivoId: tagAtivoId, turno: turno, gestorId: gestorId },
      });

      this.logger.log(TYPES_NOTICES.CREATE);
      return criar;
    } catch (error) {
      this.logger.log(TYPES_NOTICES.SERVICE_FAILURE, ' - create()');
      throw error;
    }
  }

  async createAll(
    setorId: string,
    turno: TipoTurno,
    gestorId: string,
  ): Promise<Prisma.BatchPayload> {
    try {
      let criarAlocacao: Prisma.BatchPayload = { count: 0 };

      const condicao: Prisma.AlocacaoOperacionalWhereInput = {
        turno: turno,
        situacao: { not: SituacaoAlocacao.FINALIZADO },
        condicao: { not: CondicaoAlocacao.RECUSADO },
        tagAtivo: { ativo: { setorId: setorId } },
      };

      const listarAlocacao =
        await this.prisma.client.alocacaoOperacional.findMany({
          where: condicao,
        });

      const queryT: QueryTagAtivoSetoresDto = { setorId: setorId };
      const listarTags = await this.tagAtivoService.findAllSection(queryT);

      if (listarAlocacao.length !== listarTags.length) {
        const tagsAlocados = new Set(
          listarAlocacao.map((a: AlocacaoOperacional) => a.tagAtivoId),
        );
        const tagsSemAlocados = listarTags
          .filter((tag) => !tagsAlocados.has(tag.id))
          .map((tag) => tag.id);
        if (tagsSemAlocados.length > 0) {
          criarAlocacao =
            await this.prisma.client.alocacaoOperacional.createMany({
              data: tagsSemAlocados.map((tagAtivoId) => ({
                tagAtivoId: tagAtivoId,
                turno: turno,
                gestorId: gestorId,
              })),
            });
        }
      }

      return criarAlocacao;
    } catch (error) {
      this.logger.log(TYPES_NOTICES.SERVICE_FAILURE, ' - createAll()');
      throw error;
    }
  }

  async checkManagerAllocation(
    query: QueryQuantidadeAlocacaoOperadorDto,
  ): Promise<ResponseAlertAlocacaoDto> {
    try {
      const qtdAlocacao = await this.prisma.client.alocacaoOperacional.count({
        where: query,
      });

      if (qtdAlocacao === 0) {
        this.logger.warn(`Operador id possui ${qtdAlocacao} alocações.`);
      } else {
        this.logger.log(`Operador id possui ${qtdAlocacao} alocações.`);
      }

      return { alocacao: qtdAlocacao };
    } catch (error) {
      this.logger.log(
        TYPES_NOTICES.SERVICE_FAILURE,
        ' - checkManagerAllocation()',
      );
      throw error;
    }
  }

  /* FUNÇÃO MONTAGEM DE CONDIÇÃO */
  private async toAssembleCondicao(
    filtros: Omit<
      QueryAlocacaoOperacionalFilterDto,
      'page' | 'size' | 'campos' | 'incluir' | 'ordenacao'
    >,
    usuarioId?: string,
  ): Promise<Prisma.AlocacaoOperacionalWhereInput> {
    const condicao: Prisma.AlocacaoOperacionalWhereInput = {};

    if (filtros.codigo) condicao.codigo = filtros.codigo;
    if (filtros.operadorId) condicao.operadorId = filtros.operadorId;
    if (filtros.gestorId) condicao.gestorId = filtros.gestorId;
    if (filtros.tagAtivoId) condicao.tagAtivoId = filtros.tagAtivoId;
    if (filtros.setorId)
      condicao.tagAtivo = { ativo: { setorId: filtros.setorId } };
    if (filtros.turno) condicao.turno = filtros.turno;
    if (filtros.condicao) condicao.condicao = filtros.condicao;
    if (filtros.situacao) condicao.situacao = filtros.situacao;
    if (filtros.status !== undefined) condicao.status = filtros.status;

    if (filtros.decisao === 'finalizado') {
      condicao.AND = { situacao: { not: SituacaoAlocacao.FINALIZADO } };
    }

    if (filtros.gestor) condicao.gestorId = usuarioId;

    return condicao;
  }

  /* FUNÇÃO MONTAGEM DE ORDENAÇÃO */
  private async toAssembleOrderBy(
    ordenacao?: string,
  ): Promise<Prisma.AlocacaoOperacionalOrderByWithRelationInput[]> {
    switch (ordenacao) {
      case 'filtrar':
        return [{ codigo: 'desc' }, { situacao: 'asc' }];
      default:
        return [{ tagAtivo: { descricao: 'asc' } }];
    }
  }

  /* FUNÇÃO MONTAGEM DE INCLUDE */
  private async toAssembleInclude(
    incluir?: string,
  ): Promise<Prisma.AlocacaoOperacionalInclude> {
    switch (incluir) {
      case 'todos_relacoes':
        return { operador: true, gestor: true, tagAtivo: true };
      default:
        return {
          operador: {
            select: { id: true, cracha: true, nome: true, turno: true },
          },
          gestor: { select: { id: true, cracha: true, nome: true } },
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
                  setor: { select: { id: true, descricao: true } },
                },
              },
            },
          },
        };
    }
  }

  /* METODO DE CONSULTA DINAMICA */
  private readonly allowedAlocacaoOperacionalFields = [
    'id',
    'codigo',
    'operadorId',
    'gestorId',
    'tagAtivoId',
    'turno',
    'condicao',
    'situacao',
    'status',
  ];

  private async buildSelect(
    campos?: string,
  ): Promise<Record<string, true> | undefined> {
    if (!campos) return undefined;

    const campoArray = campos.split(',').map((c) => c.trim());
    const selecaoObj: Record<string, true> = {};

    for (const campo of campoArray) {
      if (this.allowedAlocacaoOperacionalFields.includes(campo)) {
        selecaoObj[campo] = true;
      }
    }

    return Object.keys(selecaoObj).length > 0 ? selecaoObj : undefined;
  }

  /* FUNÇÃO DE LISTAGEM COM PAGINAÇÃO */
  async findAll(
    query: QueryAlocacaoOperacionalFilterDto,
    tx?: Prisma.TransactionClient,
  ): Promise<PaginatedResponse<any>> {
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

      if (filtros.setorId && filtros.turno) {
        await this.createAll(filtros.setorId, filtros.turno, ctx.user);
      }

      const condicao = await this.toAssembleCondicao(filtros, ctx.user);

      const selecao = await this.buildSelect(campos);

      const opcoes: Prisma.AlocacaoOperacionalFindManyArgs = {
        where: condicao,
        orderBy: await this.toAssembleOrderBy(ordenacao),
        skip: (page - 1) * size,
        take: size,
      };

      if (campos?.length) {
        opcoes.select = selecao;
      } else {
        opcoes.include = await this.toAssembleInclude(incluir);
      }

      const listar: AlocacaoListagem[] =
        await client.alocacaoOperacional.findMany(opcoes);

      const total = await client.alocacaoOperacional.count({ where: condicao });

      if (listar.length === 0) {
        this.logger.warn(TYPES_NOTICES.EMPTY_LIST);
      }

      this.logger.log(TYPES_NOTICES.FIND_ALL);
      return { dados: listar, total, pagina: page, tamanho: size };
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - FINDALL');
      throw error;
    }
  }

  /* FUNÇÃO CONTADOR DE REGISTROS SENDO O TOTAL, ACEITO, RECUSADO, AGUARDANDO, ALOCADO, DISPONIVEL, INDISPONIVEL E FINALIZADO */
  async counter(
    query?: QueryAlocacaoOperacionalCounterDto,
  ): Promise<ResponseAlocacaoContadorDto> {
    try {
      const ctx = this.tenantContext.getStore()!;

      const buscarPerfil = await this.perfilService.findOne(ctx.perfil);
      const perfil = `${buscarPerfil.descricao} - ${buscarPerfil.nivel}`;

      const condicao: Prisma.AlocacaoOperacionalWhereInput = {};

      if (query?.gestor && perfil === ROLES.SUP1) {
        condicao.gestorId = ctx.user;
      } else if (!query?.gestor && perfil !== ROLES.ASN1) {
        this.logger.warn(
          `Perfil ${perfil} não autorizado. `,
          TYPES_NOTICES.UNAUTHORIZED,
        );
        throw new UnauthorizedException(
          `Perfil ${perfil} não autorizado. `,
          TYPES_NOTICES.UNAUTHORIZED,
        );
      }

      const totalAlocacao = await this.prisma.client.alocacaoOperacional.count({
        where: condicao,
      });

      const gruposCondicao = await this.prisma.alocacaoOperacional.groupBy({
        by: ['condicao'],
        where: condicao,
        _count: { _all: true },
      });

      const aceito =
        gruposCondicao.find((g) => g.condicao === CondicaoAlocacao.ACEITO)
          ?._count._all ?? 0;
      const recusado =
        gruposCondicao.find((g) => g.condicao === CondicaoAlocacao.RECUSADO)
          ?._count._all ?? 0;
      const aguardando =
        gruposCondicao.find((g) => g.condicao === CondicaoAlocacao.AGUARDANDO)
          ?._count._all ?? 0;

      const gruposSituacao = await this.prisma.alocacaoOperacional.groupBy({
        by: ['situacao'],
        where: condicao,
        _count: { _all: true },
      });

      const alocado =
        gruposSituacao.find((g) => g.situacao === SituacaoAlocacao.ALOCADO)
          ?._count._all ?? 0;
      const disponivel =
        gruposSituacao.find((g) => g.situacao === SituacaoAlocacao.DISPONIVEL)
          ?._count._all ?? 0;
      const indisponivel =
        gruposSituacao.find((g) => g.situacao === SituacaoAlocacao.INDISPONIVEL)
          ?._count._all ?? 0;
      const finalizado =
        gruposSituacao.find((g) => g.situacao === SituacaoAlocacao.FINALIZADO)
          ?._count._all ?? 0;

      this.logger.log(TYPES_NOTICES.COUNTER);
      return {
        total: totalAlocacao,
        aceito: aceito,
        recusado: recusado,
        aguardando: aguardando,
        alocado: alocado,
        disponivel: disponivel,
        indisponivel: indisponivel,
        finalizado: finalizado,
      };
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - COUNTER');
      throw error;
    }
  }

  async findOne(
    id: string,
    tx?: Prisma.TransactionClient,
  ): Promise<AlocacaoListagem> {
    try {
      const client = tx ?? this.prisma.client;
      const buscar = await client.alocacaoOperacional.findUnique({
        where: { id: id },
        include: {
          tagAtivo: { include: { ativo: true } },
          operador: true,
          gestor: true,
        },
      });

      if (!buscar) {
        this.logger.warn(TYPES_NOTICES.NOT_FOUND);
        throw new NotFoundException(TYPES_NOTICES.NOT_FOUND);
      }

      return buscar;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - FINDONE');
      throw error;
    }
  }

  async findOneAllocation(
    query: QueryAlocacaoOperacionalFilterDto,
    tx?: Prisma.TransactionClient,
  ): Promise<AlocacaoListagem> {
    try {
      const client = tx ?? this.prisma.client;
      const {
        page = 1,
        size = 10,
        campos,
        incluir,
        ordenacao,
        ...filtros
      } = query;

      const condicao = await this.toAssembleCondicao(filtros);
      const selecao = await this.buildSelect(campos);
      const opcoes: Prisma.AlocacaoOperacionalFindManyArgs = {
        where: condicao,
      };

      if (campos?.length) {
        opcoes.select = selecao;
      } else {
        opcoes.include = await this.toAssembleInclude(incluir);
      }

      const buscar: AlocacaoListagem =
        await client.alocacaoOperacional.findFirst(opcoes);

      return buscar;
    } catch (error) {
      this.logger.error(
        TYPES_NOTICES.SERVICE_FAILURE,
        ' - findOneAllocation()',
      );
      throw error;
    }
  }

  async findOperatorRequest(
    query: QueryAlocacaoOperacionalSolicitacaoDto,
  ): Promise<AlocacaoOperacional> {
    try {
      const { gestorId, tagAtivoId, situacao } = query;

      const condicao: Prisma.AlocacaoOperacionalWhereInput = {
        situacao: situacao,
        ...(gestorId !== undefined && { gestorId }),
        ...(tagAtivoId !== undefined && { tagAtivoId }),
      };

      const operador = await this.prisma.client.alocacaoOperacional.findFirst({
        where: condicao,
        take: 1,
        orderBy: { codigo: 'desc' },
      });
      if (!operador) {
        this.logger.warn('Falha na busca do operador!');
      }

      return operador;
    } catch (error) {
      this.logger.error(
        TYPES_NOTICES.SERVICE_FAILURE,
        ' - findOperatorSolicitacao()',
      );
      throw error;
    }
  }

  async update(
    id: string,
    update: UpdateAlocacaoDto,
  ): Promise<AlocacaoListagem> {
    try {
      const atualizarAlocacao = await this.prisma.client.$transaction(
        async (tx: any) => {
          const alocacao = await this.findOne(id, tx);
          const { tagAtivoId, turno, gestorId } = alocacao;

          const atualizar = await tx.alocacaoOperacional.update({
            where: { id: id },
            data: update,
          });

          if (update.situacao === SituacaoAlocacao.FINALIZADO) {
            await this.create(tagAtivoId, turno, gestorId!, tx);
          }

          return atualizar;
        },
      );

      this.logger.log(TYPES_NOTICES.UPDATE);
      return atualizarAlocacao;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - UPDATE');
      throw error;
    }
  }

  async deactive(id: string): Promise<AlocacaoListagem> {
    try {
      const inativarPerfil = await this.prisma.client.$transaction(
        async (tx: any) => {
          const verificar = await this.findOne(id, tx);

          if (!verificar.status) {
            this.logger.warn(TYPES_NOTICES.IS_DEACTIVE);
            throw new UnauthorizedException(TYPES_NOTICES.IS_DEACTIVE);
          }

          const inativar = await tx.alocacaoOperacional.update({
            where: { id: id },
            data: { status: false, _auditAction: Acao.DEACTIVATE },
          });

          return inativar;
        },
      );

      this.logger.log(TYPES_NOTICES.DEACTIVE);
      return inativarPerfil;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - DEACTIVE');
      throw error;
    }
  }

  async remove(id: string): Promise<AlocacaoListagem> {
    try {
      const removerAlocacao = await this.prisma.client.$transaction(
        async (tx: any) => {
          const verificar = await this.findOne(id, tx);

          if (verificar.status) {
            this.logger.warn(TYPES_NOTICES.UNAUTHORIZED);
            throw new UnauthorizedException(TYPES_NOTICES.UNAUTHORIZED);
          }

          const remover = await tx.alocacaoOperacional.delete({
            where: { id: id },
          });

          return remover;
        },
      );

      this.logger.log(TYPES_NOTICES.DELETE);
      return removerAlocacao;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - REMOVE');
      throw error;
    }
  }
}
