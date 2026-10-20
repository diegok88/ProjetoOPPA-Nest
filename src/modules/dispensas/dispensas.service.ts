import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateDispensaDto } from './dto/create-dispensa.dto';
import { UpdateDispensaDto } from './dto/update-dispensa.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { Dispensa, DispensaListagem } from './entities/dispensa.entity';
import { TYPES_NOTICES } from '@/utils/types-notices.cosnt';

import {
  Acao,
  Prisma,
  SituacaoDispensa,
  TipoDispensa,
} from '@/generated/prisma/client';
import {
  QueryDispensaCounterDto,
  QueryDispensaDateFilterDto,
  QueryDispensaFilterDto,
} from './dto/query-dispensas.dto';
import { TenantContextService } from '@/auth/tenant-context/tenant-context.service';
import {
  ResponseAlertDispensaDto,
  ResponseDispensaContadorDto,
} from './dto/response-dispensas.dto';
import { PenalidadesService } from '../penalidades/penalidades.service';
import { PerfilService } from '../perfil/perfil.service';
import { ROLES } from '@/auth/guards/roles.const';

interface CheckDismissal {
  usuarioId: string;
  dataInicial: Date;
  dataFinal: Date;
  dispensaId?: string;
}

@Injectable()
export class DispensasService {
  private logger = new Logger(DispensasService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly penalidadeService: PenalidadesService,
    private readonly perfilService: PerfilService,
    private readonly tenantContext: TenantContextService,
  ) {}

  /* SERVIÇO DE CRIAÇÃO DE DISPENSA
  - Cria a dispensa.
  - Verifica se o colaborador possui dispensas ou penalidades nas datas solicitadas.
  */
  async create(create: CreateDispensaDto): Promise<Dispensa> {
    try {
      const criarDispensa = await this.prisma.client.$transaction(
        async (tx: any) => {
          const ctx = this.tenantContext.getStore()!;

          const verificarColaborador = {
            usuarioId: create.colaboradorId,
            dataInicial: create.dataInicial,
            dataFinal: create.dataFinal,
          };
          await this.checkEmployeeDismissal(verificarColaborador, tx);
          await this.penalidadeService.checkEmployeePenalty(
            verificarColaborador,
            tx,
          );

          const criar = await this.prisma.client.dispensa.create({
            data: {
              ...create,
              gestorId: ctx.user,
              situacaoDispensa: SituacaoDispensa.PENDENTE,
            },
          });
          this.logger.log(TYPES_NOTICES.CREATE);
          return criar;
        },
      );
      return criarDispensa;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - create()');
      throw error;
    }
  }

  /* FUNÇÕES DE VERIFICAÇÃO DE EXITENCIA DE DISPENSAS EM EXECUÇÃO 
  - aplicado internamente no serviço.
  */
  async checkEmployeeDismissal(
    verificar: CheckDismissal,
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    try {
      const client = tx ?? this.prisma.client;

      const condicao: Prisma.DispensaWhereInput = {};
      condicao.colaboradorId = verificar.usuarioId;
      condicao.AND = [
        { id: { not: verificar.dispensaId } },
        { dataInicial: { lte: verificar.dataFinal } },
        { dataFinal: { gte: verificar.dataInicial } },
        {
          situacaoDispensa: {
            notIn: [SituacaoDispensa.FINALIZADA, SituacaoDispensa.CANCELADA],
          },
        },
      ];

      const qtdDispensas = await client.dispensa.count({ where: condicao });

      if (qtdDispensas > 0) {
        this.logger.error(
          `O colaborador possui ${qtdDispensas} dispensas nas datas solicitadas`,
        );
        throw new UnauthorizedException(
          `O colaborador possui ${qtdDispensas} dispensas nas datas solicitadas`,
        );
      }

      this.logger.log(TYPES_NOTICES.EMPTY_LIST);
    } catch (error) {
      this.logger.error(
        TYPES_NOTICES.SERVICE_FAILURE,
        ' - checkEmployeeDismissal()',
      );
      throw error;
    }
  }

  async checkManagerDismissal(
    verificar: CheckDismissal,
    tx?: Prisma.TransactionClient,
  ): Promise<number> {
    try {
      const client = tx ?? this.prisma.client;

      const condicao: Prisma.DispensaWhereInput = {};
      condicao.gestorId = verificar.usuarioId;
      condicao.AND = [
        { dataInicial: { lte: verificar.dataFinal } },
        { dataFinal: { gte: verificar.dataInicial } },
        {
          situacaoDispensa: {
            notIn: [SituacaoDispensa.FINALIZADA, SituacaoDispensa.CANCELADA],
          },
        },
      ];

      const qtdDispensas = await client.dispensa.count({ where: condicao });

      if (qtdDispensas > 0) {
        this.logger.log(TYPES_NOTICES.EMPTY_NOT, ` - ${qtdDispensas}`);
      }

      return qtdDispensas;
    } catch (error) {
      this.logger.error(
        TYPES_NOTICES.SERVICE_FAILURE,
        ' - checkManagerDismissal()',
      );
      throw error;
    }
  }

  /* SERVIÇO DE BUSCA DE QUANTIDADE DE DISPENSAS E PENALIDADES 
  - Usado para alertar antes de um cadastro ou alteração a quantidade de registro nas datas consultadas.
  */
  async checkAlertManagerDismissal(
    query: QueryDispensaDateFilterDto,
  ): Promise<ResponseAlertDispensaDto> {
    try {
      const ctx = this.tenantContext.getStore()!;

      const verificarGestor = {
        usuarioId: ctx.user,
        dataInicial: query.dataInicial!,
        dataFinal: query.dataFinal!,
      };

      const dispensas = await this.checkManagerDismissal(verificarGestor);
      const penalidades =
        await this.penalidadeService.checkManagerPenalty(verificarGestor);

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
    query: QueryDispensaFilterDto,
    tx?: Prisma.TransactionClient,
  ): Promise<DispensaListagem[]> {
    try {
      const ctx = this.tenantContext.getStore()!;

      const client = tx ?? this.prisma.client;

      const { campos, ...filtros } = query ?? {};

      const condicao: Prisma.DispensaWhereInput = {};
      if (filtros.colaboradorId) condicao.colaboradorId = filtros.colaboradorId;
      if (filtros.gestorId) condicao.gestorId = filtros.gestorId;
      if (filtros.tipoDispensa) condicao.tipoDispensa = filtros.tipoDispensa;
      if (filtros.situacaoDispensa)
        condicao.situacaoDispensa = filtros.situacaoDispensa;
      if (filtros.dataInicial || filtros.dataFinal) {
        condicao.dataInicial = {
          ...(filtros.dataInicial && { gte: filtros.dataInicial }),
          ...(filtros.dataFinal && { lte: filtros.dataFinal }),
        };
      }
      if (filtros.status !== undefined) condicao.status = filtros.status;
      if (filtros.gestor) condicao.gestorId = ctx.user;

      const selecao = await this.buildSelect(campos);

      const INCLUDES: Record<string, Prisma.DispensaInclude> = {
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

      const opcoes: Prisma.DispensaFindManyArgs = {
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

      const listar: Dispensa[] = await client.dispensa.findMany(opcoes);

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

  /* FUNÇÃO CONTADOR DE REGISTROS SENDO O TOTAL,  PENDENTE, CANCELADO, EXECUÇÃO, FINALIZADOS, BANCO DE HORAS, FERIAS E ATESTADOS */
  async counter(
    query?: QueryDispensaCounterDto,
  ): Promise<ResponseDispensaContadorDto> {
    try {
      const ctx = this.tenantContext.getStore()!;

      const buscarPerfil = await this.perfilService.findOne(ctx.perfil);
      const perfil = `${buscarPerfil.descricao} - ${buscarPerfil.nivel}`;

      const condicao: Prisma.DispensaWhereInput = {};

      if (query && query.gestor) {
        condicao.gestorId = ctx.user;
      } else if (query && !query.gestor) {
        if (perfil === ROLES.ADN1) {
          const filtroEmpresa: Prisma.DispensaWhereInput['colaborador'] = {};
          if (!filtroEmpresa.empresaId) filtroEmpresa.empresaId = ctx.empresa;
          if (Object.keys(filtroEmpresa).length > 0)
            condicao.colaborador = filtroEmpresa;
        }
      }

      const gruposDispensa = await this.prisma.dispensa.groupBy({
        by: ['tipoDispensa'],
        where: condicao,
        _count: { _all: true },
      });

      const atestado =
        gruposDispensa.find((g) => g.tipoDispensa === TipoDispensa.ATESTADO)
          ?._count._all ?? 0;
      const bancoDeHoras =
        gruposDispensa.find(
          (g) => g.tipoDispensa === TipoDispensa.BANCO_DE_HORAS,
        )?._count._all ?? 0;
      const ferias =
        gruposDispensa.find((g) => g.tipoDispensa === TipoDispensa.FERIAS)
          ?._count._all ?? 0;

      const gruposSituacao = await this.prisma.dispensa.groupBy({
        by: ['situacaoDispensa'],
        where: condicao,
        _count: { _all: true },
      });

      const pendente =
        gruposSituacao.find(
          (g) => g.situacaoDispensa === SituacaoDispensa.PENDENTE,
        )?._count._all ?? 0;

      const cancelada =
        gruposSituacao.find(
          (g) => g.situacaoDispensa === SituacaoDispensa.CANCELADA,
        )?._count._all ?? 0;
      const execucao =
        gruposSituacao.find(
          (g) => g.situacaoDispensa === SituacaoDispensa.EXECUCAO,
        )?._count._all ?? 0;
      const finalizada =
        gruposSituacao.find(
          (g) => g.situacaoDispensa === SituacaoDispensa.FINALIZADA,
        )?._count._all ?? 0;

      this.logger.log(TYPES_NOTICES.COUNTER);
      return {
        total: atestado + bancoDeHoras + ferias,
        pendente,
        cancelada,
        execucao,
        finalizada,
        atestado,
        bancoDeHoras,
        ferias,
      };
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - COUNTER');
      throw error;
    }
  }

  async findOne(id: string, tx?: Prisma.TransactionClient): Promise<Dispensa> {
    try {
      const client = tx ?? this.prisma.client;
      const buscar = await client.dispensa.findUnique({
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

  async update(id: string, update: UpdateDispensaDto): Promise<Dispensa> {
    try {
      const atualizarDispensa = await this.prisma.client.$transaction(
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
              dispensaId: buscar.id,
            };
            await this.checkEmployeeDismissal(verificarColaborador, tx);
            await this.penalidadeService.checkEmployeePenalty(
              verificarColaborador,
              tx,
            );
          }

          const atualizar = await tx.dispensa.update({
            where: { id: id },
            data: update,
          });

          return atualizar;
        },
      );

      this.logger.log(TYPES_NOTICES.UPDATE);
      return atualizarDispensa;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - UPDATE');
      throw error;
    }
  }

  async updateSituation(id: string): Promise<Dispensa> {
    try {
      const atualizarSituacao = await this.prisma.client.$transaction(
        async (tx: any) => {
          const buscar = await this.findOne(id, tx);

          if (buscar.situacaoDispensa === SituacaoDispensa.EXECUCAO) {
            this.logger.log(TYPES_NOTICES.UNAUTHORIZED, ' - updateSituation()');
            throw new UnauthorizedException(TYPES_NOTICES.UNAUTHORIZED);
          }

          const situacao =
            buscar.situacaoDispensa === SituacaoDispensa.PENDENTE
              ? SituacaoDispensa.CANCELADA
              : SituacaoDispensa.PENDENTE;

          const atualizar = await tx.dispensa.update({
            where: { id: id },
            data: { situacaoDispensa: situacao },
          });

          return atualizar;
        },
      );
      this.logger.log(TYPES_NOTICES.UPDATE_SITUATION);
      return atualizarSituacao;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - updateSituation()');
      throw error;
    }
  }

  async active(id: string): Promise<Dispensa> {
    try {
      const ativarDispensa = await this.prisma.client.$transaction(
        async (tx: any) => {
          const verificar = await this.findOne(id, tx);

          if (verificar.status) {
            this.logger.warn(TYPES_NOTICES.IS_ACTIVE);
            throw new UnauthorizedException(TYPES_NOTICES.IS_ACTIVE);
          }

          const ativar = await tx.dispensa.update({
            where: { id: id },
            data: { status: true, _auditAction: Acao.ACTIVE },
          });

          return ativar;
        },
      );

      this.logger.log(TYPES_NOTICES.DEACTIVE);
      return ativarDispensa;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - ACTIVE');
      throw error;
    }
  }

  async deactive(id: string): Promise<Dispensa> {
    try {
      const inativarDispensa = await this.prisma.client.$transaction(
        async (tx: any) => {
          const verificar = await this.findOne(id, tx);

          if (!verificar.status) {
            this.logger.warn(TYPES_NOTICES.IS_DEACTIVE);
            throw new UnauthorizedException(TYPES_NOTICES.IS_DEACTIVE);
          }

          const inativar = await tx.dispensa.update({
            where: { id: id },
            data: { status: false, _auditAction: Acao.DEACTIVATE },
          });

          return inativar;
        },
      );

      this.logger.log(TYPES_NOTICES.DEACTIVE);
      return inativarDispensa;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - DEACTIVE');
      throw error;
    }
  }

  async remove(id: string): Promise<Dispensa> {
    try {
      const removerDispensa = await this.prisma.client.$transaction(
        async (tx: any) => {
          const verificar = await this.findOne(id, tx);

          if (verificar.status) {
            this.logger.warn(TYPES_NOTICES.UNAUTHORIZED);
            throw new UnauthorizedException(TYPES_NOTICES.UNAUTHORIZED);
          }

          const remover = await tx.dispensa.delete({
            where: { id: id },
          });

          return remover;
        },
      );

      this.logger.log(TYPES_NOTICES.DELETE);
      return removerDispensa;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - REMOVE');
      throw error;
    }
  }

  private readonly allowedDispensaFields = [
    'id',
    'codigo',
    'usuarioId',
    'gestorId',
    'tipoDispensa',
    'situacaoDispensa',
    'dataInicial',
    'dataFinal',
    'status',
  ];

  private async buildSelect(
    campos?: string,
  ): Promise<Record<string, true> | undefined> {
    if (!campos) return undefined;

    const campoArray = campos.split(',').map((c) => c.trim());
    const selecaoObj = {};

    for (const campo of campoArray) {
      if (this.allowedDispensaFields.includes(campo)) {
        selecaoObj[campo] = true;
      }
    }

    return Object.keys(selecaoObj).length > 0 ? selecaoObj : undefined;
  }
}
