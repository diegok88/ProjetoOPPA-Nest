import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreatePenalidadeDto } from './dto/create-penalidade.dto';
import { UpdatePenalidadeDto } from './dto/update-penalidade.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { Penalidade, PenalidadeListagem } from './entities/penalidade.entity';
import { TYPES_NOTICES } from '@/utils/types-notices.cosnt';
import {
  Acao,
  Prisma,
  SituacaoPenalidade,
  TipoPenalidade,
} from '@/generated/prisma/client';
import {
  QueryPenalidadeCounterDto,
  QueryPenalidadeDateFilterDto,
  QueryPenalidadeFilterDto,
} from './dto/query-penalidades.dto';
import { TenantContextService } from '@/auth/tenant-context/tenant-context.service';
import {
  ResponseAlertPenalidadeDto,
  ResponsePenalidadeContadorDto,
} from './dto/response-penalidades.dto';
import { DispensasOrquestradorService } from '@/services-orchestrator/dispensas/dispensas-orquestrador.service';
import { PerfilService } from '../perfil/perfil.service';
import { ROLES } from '@/auth/guards/roles.const';

interface CheckPenalty {
  usuarioId: string;
  dataInicial: Date;
  dataFinal: Date;
  penalidadeId?: string;
}

@Injectable()
export class PenalidadesService {
  private logger = new Logger(PenalidadesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly dispensasOrq: DispensasOrquestradorService,
    private readonly perfilService: PerfilService,
    private readonly tenantContext: TenantContextService,
  ) {}

  async create(create: CreatePenalidadeDto): Promise<Penalidade> {
    try {
      const criarPenalidade = await this.prisma.client.$transaction(
        async (tx: any) => {
          const ctx = this.tenantContext.getStore()!;

          const verificarColaborador = {
            usuarioId: create.colaboradorId,
            dataInicial: create.dataInicial,
            dataFinal: create.dataFinal,
          };

          await this.checkEmployeePenalty(verificarColaborador, tx);
          await this.dispensasOrq.checkEmployeeDismissal(
            verificarColaborador,
            tx,
          );

          let situacao: SituacaoPenalidade;

          if (create.tipoPenalidade !== TipoPenalidade.SUSPENSAO) {
            situacao = SituacaoPenalidade.EXECUCAO;
          } else {
            situacao = SituacaoPenalidade.PENDENTE;
          }

          const criar = await this.prisma.client.penalidade.create({
            data: {
              ...create,
              gestorId: ctx.user,
              situacaoPenalidade: situacao,
            },
          });

          return criar;
        },
      );

      this.logger.log(TYPES_NOTICES.CREATE);
      return criarPenalidade;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - CREATE');
      throw error;
    }
  }

  /* FUNÇÕES DE VERIFICAÇÃO DE EXITENCIA DE PENALIDADES EM EXECUÇÃO 
    - aplicado internamente no serviço.
  */
  async checkEmployeePenalty(
    verificar: CheckPenalty,
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    try {
      const client = tx ?? this.prisma.client;

      const condicao: Prisma.PenalidadeWhereInput = {};
      condicao.colaboradorId = verificar.usuarioId;
      condicao.AND = [
        { id: { not: verificar.penalidadeId } },
        { dataInicial: { lte: verificar.dataFinal } },
        { dataFinal: { gte: verificar.dataInicial } },
        {
          situacaoPenalidade: {
            notIn: [
              SituacaoPenalidade.FINALIZADA,
              SituacaoPenalidade.CANCELADA,
            ],
          },
        },
        { tipoPenalidade: { in: [TipoPenalidade.SUSPENSAO] } },
      ];

      const qtdPenalidades = await client.penalidade.count({ where: condicao });

      if (qtdPenalidades > 0) {
        this.logger.error(
          `O colaborador possui ${qtdPenalidades} penalidades nas datas solicitadas`,
        );
        throw new UnauthorizedException(
          TYPES_NOTICES.EMPTY_NOT,
          ' - checkEmployeePenalidade( )',
        );
      }

      this.logger.log(TYPES_NOTICES.EMPTY_LIST);
    } catch (error) {
      this.logger.error(
        TYPES_NOTICES.SERVICE_FAILURE,
        ' - checkEmployeePenalidade()',
      );
      throw error;
    }
  }

  async checkManagerPenalty(
    verificar: CheckPenalty,
    tx?: Prisma.TransactionClient,
  ): Promise<number> {
    try {
      const client = tx ?? this.prisma.client;

      const condicao: Prisma.PenalidadeWhereInput = {};
      condicao.gestorId = verificar.usuarioId;
      condicao.AND = [
        { dataInicial: { lte: verificar.dataFinal } },
        { dataFinal: { gte: verificar.dataInicial } },
        {
          situacaoPenalidade: {
            notIn: [
              SituacaoPenalidade.FINALIZADA,
              SituacaoPenalidade.CANCELADA,
            ],
          },
        },
        { tipoPenalidade: { in: [TipoPenalidade.SUSPENSAO] } },
      ];

      const qtdPenalidades = await client.penalidade.count({ where: condicao });

      if (qtdPenalidades > 0) {
        this.logger.log(TYPES_NOTICES.EMPTY_NOT, ` - ${qtdPenalidades}`);
      }

      return qtdPenalidades;
    } catch (error) {
      this.logger.error(
        TYPES_NOTICES.SERVICE_FAILURE,
        ' - checkManagerPenalidade()',
      );
      throw error;
    }
  }

  /* SERVIÇO DE BUSCA DE QUANTIDADE DE DISPENSAS E PENALIDADES 
    - Usado para alertar antes de um cadastro ou alteração a quantidade de registro nas datas consultadas.
    */
  async checkAlertManagerPenality(
    query: QueryPenalidadeDateFilterDto,
  ): Promise<ResponseAlertPenalidadeDto> {
    try {
      const ctx = this.tenantContext.getStore()!;

      const verificarGestor = {
        usuarioId: ctx.user,
        dataInicial: query.dataInicial!,
        dataFinal: query.dataFinal!,
      };

      const penalidades = await this.checkManagerPenalty(verificarGestor);
      const dispensas =
        await this.dispensasOrq.checkManagerDismissal(verificarGestor);

      return { penalidade: penalidades, dispensa: dispensas };
    } catch (error) {
      this.logger.error(
        TYPES_NOTICES.SERVICE_FAILURE,
        ' - checkAlertManagerDismissal()',
      );
      throw error;
    }
  }

  async findAll(
    query: QueryPenalidadeFilterDto,
    tx?: Prisma.TransactionClient,
  ): Promise<PenalidadeListagem[]> {
    try {
      const ctx = this.tenantContext.getStore()!;

      const client = tx ?? this.prisma.client;

      const { campos, ...filtros } = query ?? {};

      const condicao: Prisma.PenalidadeWhereInput = {};
      if (filtros.colaboradorId) condicao.colaboradorId = filtros.colaboradorId;
      if (filtros.gestorId) condicao.gestorId = filtros.gestorId;
      if (filtros.gestor) condicao.gestorId = ctx.user;
      if (filtros.tipoPenalidade)
        condicao.tipoPenalidade = filtros.tipoPenalidade;
      if (filtros.situacaoPenalidade)
        condicao.situacaoPenalidade = filtros.situacaoPenalidade;
      if (filtros.dataInicial || filtros.dataFinal) {
        condicao.dataInicial = {
          ...(filtros.dataInicial && { gte: filtros.dataInicial }),
          ...(filtros.dataFinal && { lte: filtros.dataFinal }),
        };
      }
      if (filtros.status !== undefined) condicao.status = filtros.status;

      const selecao = await this.buildSelect(campos);

      const INCLUDES: Record<string, Prisma.PenalidadeInclude> = {
        todos_relacoes: { colaborador: true, gestor: true },
        colaborador: { colaborador: true },
        gestor: { gestor: true },
        usuario_parcial: {
          colaborador: { select: { nome: true, cracha: true } },
        },
        gestor_parcial: {
          gestor: { select: { nome: true, cracha: true } },
        },
      };

      const opcoes: Prisma.PenalidadeFindManyArgs = {
        where: condicao,
        orderBy: { dataInicial: 'desc' },
      };

      if (campos?.length) {
        opcoes.select = selecao;
      } else {
        const incluir =
          filtros.incluir && INCLUDES[filtros.incluir]
            ? INCLUDES[filtros.incluir]
            : undefined;

        if (incluir) opcoes.include = incluir;
      }

      const listar: Penalidade[] = await client.penalidade.findMany(opcoes);

      if (listar.length === 0) {
        this.logger.warn(TYPES_NOTICES.EMPTY_LIST);
      }

      this.logger.log(TYPES_NOTICES.FIND_ALL);
      return listar;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - FINDALL');
      throw error;
    }
  }

  /* FUNÇÃO CONTADOR DE REGISTROS SENDO O TOTAL, EXECUÇÃO, FINALIZADOS, ORIENTAÇÃO, ADVERTÊNCIA E SUSPENSÃO */
  async counter(
    query?: QueryPenalidadeCounterDto,
  ): Promise<ResponsePenalidadeContadorDto> {
    try {
      const ctx = this.tenantContext.getStore()!;

      const buscarPerfil = await this.perfilService.findOne(ctx.perfil);
      const perfil = `${buscarPerfil.descricao} - ${buscarPerfil.nivel}`;

      const condicao: Prisma.PenalidadeWhereInput = {};

      if (query && query.gestor) {
        condicao.gestorId = ctx.user;
      } else if (query && !query.gestor) {
        if (perfil === ROLES.ADN1) {
          const filtroEmpresa: Prisma.PenalidadeWhereInput['colaborador'] = {};
          if (!filtroEmpresa.empresaId) filtroEmpresa.empresaId = ctx.empresa;
          if (Object.keys(filtroEmpresa).length > 0)
            condicao.colaborador = filtroEmpresa;
        }
      }

      const gruposPenalidade = await this.prisma.penalidade.groupBy({
        by: ['tipoPenalidade'],
        where: condicao,
        _count: { _all: true },
      });

      const orientacao =
        gruposPenalidade.find(
          (g) => g.tipoPenalidade === TipoPenalidade.ORIENTACAO,
        )?._count._all ?? 0;
      const advertencia =
        gruposPenalidade.find(
          (g) => g.tipoPenalidade === TipoPenalidade.ADVERTENCIA,
        )?._count._all ?? 0;
      const suspensao =
        gruposPenalidade.find(
          (g) => g.tipoPenalidade === TipoPenalidade.SUSPENSAO,
        )?._count._all ?? 0;

      const gruposSituacao = await this.prisma.penalidade.groupBy({
        by: ['situacaoPenalidade'],
        where: condicao,
        _count: { _all: true },
      });

      const pendente =
        gruposSituacao.find(
          (g) => g.situacaoPenalidade === SituacaoPenalidade.PENDENTE,
        )?._count._all ?? 0;
      const cancelada =
        gruposSituacao.find(
          (g) => g.situacaoPenalidade === SituacaoPenalidade.CANCELADA,
        )?._count._all ?? 0;
      const execucao =
        gruposSituacao.find(
          (g) => g.situacaoPenalidade === SituacaoPenalidade.EXECUCAO,
        )?._count._all ?? 0;
      const finalizada =
        gruposSituacao.find(
          (g) => g.situacaoPenalidade === SituacaoPenalidade.FINALIZADA,
        )?._count._all ?? 0;

      this.logger.log(TYPES_NOTICES.COUNTER);
      return {
        total: orientacao + advertencia + suspensao,
        pendente,
        cancelada,
        execucao,
        finalizada,
        orientacao,
        advertencia,
        suspensao,
      };
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - COUNTER');
      throw error;
    }
  }

  async findOne(
    id: string,
    tx?: Prisma.TransactionClient,
  ): Promise<Penalidade> {
    try {
      const client = tx ?? this.prisma.client;
      const buscar = await client.penalidade.findUnique({
        where: { id: id },
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

  async update(id: string, update: UpdatePenalidadeDto): Promise<Penalidade> {
    try {
      const atualizarPenalidade = await this.prisma.client.$transaction(
        async (tx: any) => {
          const buscar = await this.findOne(id, tx);

          if (
            buscar.dataInicial !== update.dataInicial ||
            buscar.dataFinal !== update.dataFinal
          ) {
            const verificarColaborador = {
              usuarioId: buscar.colaboradorId,
              dataInicial: update.dataInicial!,
              dataFinal: update.dataFinal!,
              penalidadeId: buscar.id,
            };
            await this.checkEmployeePenalty(verificarColaborador, tx);
            await this.dispensasOrq.checkEmployeeDismissal(
              verificarColaborador,
              tx,
            );
          }

          const atualizar = await tx.penalidade.update({
            where: { id: id },
            data: update,
          });

          return atualizar;
        },
      );

      this.logger.log(TYPES_NOTICES.UPDATE);
      return atualizarPenalidade;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - UPDATE');
      throw error;
    }
  }

  async updateSituation(id: string): Promise<Penalidade> {
    try {
      const atualizarSituacao = await this.prisma.client.$transaction(
        async (tx: any) => {
          const buscar = await this.findOne(id, tx);

          if (buscar.situacaoPenalidade === SituacaoPenalidade.EXECUCAO) {
            this.logger.log(TYPES_NOTICES.UNAUTHORIZED, ' - updateSituation()');
            throw new UnauthorizedException(TYPES_NOTICES.UNAUTHORIZED);
          }

          const situacao =
            buscar.situacaoPenalidade === SituacaoPenalidade.PENDENTE
              ? SituacaoPenalidade.CANCELADA
              : SituacaoPenalidade.PENDENTE;

          const atualizar = await tx.penalidade.update({
            where: { id: id },
            data: { situacaoPenalidade: situacao },
          });

          return atualizar;
        },
      );
      this.logger.log(TYPES_NOTICES.UPDATE_SITUATION);
      return atualizarSituacao;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - UPDATE-SITUATION');
      throw error;
    }
  }

  async active(id: string): Promise<Penalidade> {
    try {
      const ativarPenalidade = await this.prisma.client.$transaction(
        async (tx: any) => {
          const verificar = await this.findOne(id, tx);

          if (verificar.status) {
            this.logger.warn(TYPES_NOTICES.IS_DEACTIVE);
            throw new UnauthorizedException(TYPES_NOTICES.IS_DEACTIVE);
          }

          const ativar = await tx.penalidade.update({
            where: { id: id },
            data: { status: true, _auditAction: Acao.ACTIVE },
          });

          return ativar;
        },
      );

      this.logger.log(TYPES_NOTICES.DEACTIVE);
      return ativarPenalidade;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - DEACTIVE');
      throw error;
    }
  }

  async deactive(id: string): Promise<Penalidade> {
    try {
      const inativarPenalidade = await this.prisma.client.$transaction(
        async (tx: any) => {
          const verificar = await this.findOne(id, tx);

          if (!verificar.status) {
            this.logger.warn(TYPES_NOTICES.IS_DEACTIVE);
            throw new UnauthorizedException(TYPES_NOTICES.IS_DEACTIVE);
          }

          const inativar = await tx.penalidade.update({
            where: { id: id },
            data: { status: false, _auditAction: Acao.DEACTIVATE },
          });

          return inativar;
        },
      );

      this.logger.log(TYPES_NOTICES.DEACTIVE);
      return inativarPenalidade;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - DEACTIVE');
      throw error;
    }
  }

  async remove(id: string): Promise<Penalidade> {
    try {
      const removerPenalidade = await this.prisma.client.$transaction(
        async (tx: any) => {
          const verificar = await this.findOne(id, tx);

          if (verificar.status) {
            this.logger.warn(TYPES_NOTICES.UNAUTHORIZED);
            throw new UnauthorizedException(TYPES_NOTICES.UNAUTHORIZED);
          }

          const remover = await tx.penalidade.delete({
            where: { id: id },
          });

          return remover;
        },
      );

      this.logger.log(TYPES_NOTICES.DELETE);
      return removerPenalidade;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - REMOVE');
      throw error;
    }
  }

  private readonly allowedPenalidadeFields = [
    'id',
    'codigo',
    'colaboradorId',
    'gestorId',
    'tipoPenalidade',
    'dataInicial',
    'dataFinal',
    'justificativa',
    'situacaoPenalidade',
    'status',
  ];

  private async buildSelect(
    campos?: string,
  ): Promise<Record<string, true> | undefined> {
    if (!campos) return undefined;

    const campoArray = campos.split(',').map((c) => c.trim());
    const selecaoObj = {};

    for (const campo of campoArray) {
      if (this.allowedPenalidadeFields.includes(campo)) {
        selecaoObj[campo] = true;
      }
    }

    return Object.keys(selecaoObj).length > 0 ? selecaoObj : undefined;
  }
}
