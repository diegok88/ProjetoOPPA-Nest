import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateCompetenciaOperacionalDto } from './dto/create-competencia-operacional.dto';
import { UpdateCompetenciaOperacionalDto } from './dto/update-competencia-operacional.dto';
import { PrismaService } from '@/prisma/prisma.service';
import {
  CompetenciaOperacional,
  CompetenciaOperacionalListagem,
  CompetenciaOperacionalRelacao,
} from './entities/competencia-operacional.entity';
import { TYPES_NOTICES } from '@/utils/types-notices.cosnt';
import {
  QueryCompetenciaOperacionalCounterDto,
  QueryCompetenciaOperacionalFilterDto,
  QueryCompetenciaOperacionalOperadorDto,
} from './dto/query-competencia-operacional.dto';
import {
  Acao,
  Prisma,
  SituacaoDispensa,
  SituacaoPenalidade,
  TipoPenalidade,
} from '@/generated/prisma/client';
import { ResponseCompetenciaOperacionalContadorDto } from './dto/response-competencia-operacional.dto';
import { TenantContextService } from '@/auth/tenant-context/tenant-context.service';
import { PerfilService } from '../perfil/perfil.service';
import { ROLES } from '@/auth/guards/roles.const';
import { AtivoRelacoesParcial } from '../ativo/entities/ativo.entity';
import { AtivoService } from '../ativo/ativo.service';
import { GeradorEscalaService } from '../gerador-escala/gerador-escala.service';

@Injectable()
export class CompetenciaOperacionalService {
  private logger = new Logger(CompetenciaOperacionalService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly perfilService: PerfilService,
    private readonly ativoService: AtivoService,
    private readonly geradorEscalaService: GeradorEscalaService,
    private readonly tenantContext: TenantContextService,
  ) {}

  async create(
    create: CreateCompetenciaOperacionalDto,
  ): Promise<CompetenciaOperacional> {
    try {
      const ctx = this.tenantContext.getStore()!;
      const criar = await this.prisma.client.competenciaOperacional.create({
        data: { ...create, gestorId: ctx.user },
      });
      this.logger.log(TYPES_NOTICES.CREATE);
      return criar;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - CREATE');
      throw error;
    }
  }

  /* ----------------------------------------------------------------------------------------------------------------------------- */
  /* FUNÇÃO MONTAGEM DE CONDIÇÃO */
  private async toAssembleCondicao(
    filtros: Omit<
      QueryCompetenciaOperacionalFilterDto,
      'page' | 'size' | 'campos' | 'incluir' | 'ordenacao'
    >,
    usuarioId: string,
  ): Promise<Prisma.CompetenciaOperacionalWhereInput> {
    const condicao: Prisma.CompetenciaOperacionalWhereInput = {};
    if (filtros.operadorId) condicao.operadorId = filtros.operadorId;
    if (filtros.gestorId) condicao.gestorId = filtros.gestorId;
    if (filtros.ativoId) condicao.ativoId = filtros.ativoId;
    if (filtros.status !== undefined) condicao.status = filtros.status;

    const escalaAtual = await this.geradorEscalaService.consultarEscala();

    if (filtros.decisao === 'alocacao_sel') {
      condicao.AND = {
        operador: {
          escala: { not: escalaAtual.escala },
          penalidadeComoColaborador: {
            none: {
              tipoPenalidade: TipoPenalidade.SUSPENSAO,
              situacaoPenalidade: SituacaoPenalidade.EXECUCAO,
            },
          },
          dispensaComoColaborador: {
            none: { situacaoDispensa: SituacaoDispensa.EXECUCAO },
          },
        },
      };
    }

    if (filtros.gestor) condicao.gestorId = usuarioId;

    return condicao;
  }

  /* FUNÇÃO MONTAGEM DE ORDENAÇÃO */
  private async toAssembleOrderBy(
    ordenacao?: string,
  ): Promise<Prisma.CompetenciaOperacionalOrderByWithRelationInput[]> {
    switch (ordenacao) {
      case 'filtrar':
        return [{ codigo: 'desc' }];
      default:
        return [{ codigo: 'desc' }];
    }
  }

  /* FUNÇÃO MONTAGEM DE INCLUDE */
  private async toAssembleInclude(
    incluir?: string,
  ): Promise<Prisma.CompetenciaOperacionalInclude> {
    switch (incluir) {
      case 'todos_relacoes':
        return { operador: true, gestor: true, ativo: true };
      case 'todos_parcial':
        return {
          operador: { select: { id: true, nome: true, cracha: true } },
          gestor: { select: { id: true, nome: true, cracha: true } },
          ativo: { select: { id: true, descricao: true, modelo: true } },
        };
      case 'operador_parcial':
        return { operador: { select: { id: true, nome: true, cracha: true } } };
      default:
        return {};
    }
  }

  /* FUNÇÃO MONTAGEM DOS CAMPOS */
  private readonly allowedCompetenciaOperacionalFields = [
    'id',
    'codigo',
    'operadorId',
    'gestorId',
    'ativoId',
    'status',
  ];

  private async buildSelect(
    campos?: string,
  ): Promise<Record<string, true> | undefined> {
    if (!campos) return undefined;

    const campoArray = campos.split(',').map((c) => c.trim());
    const selecaoObj = {};

    for (const campo of campoArray) {
      if (this.allowedCompetenciaOperacionalFields.includes(campo)) {
        selecaoObj[campo] = true;
      }
    }

    return Object.keys(selecaoObj).length > 0 ? selecaoObj : undefined;
  }

  async findAll(
    query: QueryCompetenciaOperacionalFilterDto,
    tx?: Prisma.TransactionClient,
  ): Promise<CompetenciaOperacionalListagem[]> {
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
      } = query ?? {};

      const condicao = await this.toAssembleCondicao(filtros, ctx.user);

      const selecao = await this.buildSelect(campos);

      const opcoes: Prisma.CompetenciaOperacionalFindManyArgs = {
        where: condicao,
        orderBy: await this.toAssembleOrderBy(ordenacao),
      };

      if (campos?.length) {
        opcoes.select = selecao;
      } else {
        opcoes.include = await this.toAssembleInclude(incluir);
      }

      const listar: CompetenciaOperacional[] =
        await client.competenciaOperacional.findMany(opcoes);

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
  /* ----------------------------------------------------------------------------------------------------------------------------- */

  /* FUNÇÃO DE RETORNO DE ATIVOS QUE NÃO ESTA ALOCADO DE ACORDO COM O OPERADOR */
  async findAssetsAvailable(
    query: QueryCompetenciaOperacionalOperadorDto,
  ): Promise<AtivoRelacoesParcial[]> {
    try {
      const queryCO: QueryCompetenciaOperacionalFilterDto = {
        operadorId: query.operadorId,
        status: true,
      };
      const competencia = await this.findAll(queryCO);
      const ids = competencia.map((c) => c.ativoId);

      const ativos = await this.ativoService.findAssetsAvailable(ids);

      return ativos;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - FINDALL');
      throw error;
    }
  }

  /* FUNÇÃO CONTADOR DE REGISTROS SENDO O TOTAL,  PENDENTE, CANCELADO, EXECUÇÃO, FINALIZADOS, BANCO DE HORAS, FERIAS E ATESTADOS */
  async counter(
    query?: QueryCompetenciaOperacionalCounterDto,
  ): Promise<ResponseCompetenciaOperacionalContadorDto> {
    try {
      const ctx = this.tenantContext.getStore()!;

      const buscarPerfil = await this.perfilService.findOne(ctx.perfil);
      const perfil = `${buscarPerfil.descricao} - ${buscarPerfil.nivel}`;

      const condicao: Prisma.CompetenciaOperacionalWhereInput = {};

      if (query && query.gestor) {
        condicao.gestorId = ctx.user;
      } else if (query && !query.gestor) {
        if (perfil === ROLES.ADN1) {
          const filtroEmpresa: Prisma.CompetenciaOperacionalWhereInput['operador'] =
            {};
          if (!filtroEmpresa.empresaId) filtroEmpresa.empresaId = ctx.empresa;
          if (Object.keys(filtroEmpresa).length > 0)
            condicao.operador = filtroEmpresa;
        }
      }

      const gruposCompetencia =
        await this.prisma.competenciaOperacional.groupBy({
          by: ['status'],
          where: condicao,
          _count: { _all: true },
        });

      const ativos =
        gruposCompetencia.find((g) => g.status === true)?._count._all ?? 0;
      const inativos =
        gruposCompetencia.find((g) => g.status === false)?._count._all ?? 0;

      this.logger.log(TYPES_NOTICES.COUNTER);
      return {
        total: ativos + inativos,
        ativos: ativos,
        inativos: inativos,
      };
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - COUNTER');
      throw error;
    }
  }

  async findOne(
    id: string,
    tx?: Prisma.TransactionClient,
  ): Promise<CompetenciaOperacionalRelacao> {
    try {
      const client = tx ?? this.prisma.client;
      const buscar = await client.competenciaOperacional.findUnique({
        where: { id: id },
        include: {
          operador: true,
          gestor: true,
          ativo: true,
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

  async update(
    id: string,
    updateCompetenciaOperacionalDto: UpdateCompetenciaOperacionalDto,
  ): Promise<CompetenciaOperacional> {
    try {
      const atualizarCompetencia = await this.prisma.client.$transaction(
        async (tx: any) => {
          await this.findOne(id, tx);

          const atualizar = await tx.competenciaOperacional.update({
            where: { id: id },
            data: updateCompetenciaOperacionalDto,
          });

          return atualizar;
        },
      );

      this.logger.log(TYPES_NOTICES.UPDATE);
      return atualizarCompetencia;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - UPDATE');
      throw error;
    }
  }

  async deactive(id: string): Promise<CompetenciaOperacional> {
    try {
      const inativarCompetencia = await this.prisma.client.$transaction(
        async (tx: any) => {
          const verificar = await this.findOne(id, tx);

          if (!verificar.status) {
            this.logger.warn(TYPES_NOTICES.IS_DEACTIVE);
            throw new UnauthorizedException(TYPES_NOTICES.IS_DEACTIVE);
          }

          const inativar = await tx.competenciaOperacional.update({
            where: { id: id },
            data: { status: false, _auditAction: Acao.DEACTIVATE },
          });

          return inativar;
        },
      );

      this.logger.log(TYPES_NOTICES.DEACTIVE);
      return inativarCompetencia;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - DEACTIVE');
      throw error;
    }
  }

  async remove(id: string): Promise<CompetenciaOperacional> {
    try {
      const removerCompetencia = await this.prisma.client.$transaction(
        async (tx: any) => {
          const verificar = await this.findOne(id, tx);

          if (verificar.status) {
            this.logger.warn(TYPES_NOTICES.UNAUTHORIZED);
            throw new UnauthorizedException(TYPES_NOTICES.UNAUTHORIZED);
          }

          const remover = await tx.competenciaOperacional.delete({
            where: { id: id },
          });

          return remover;
        },
      );

      this.logger.log(TYPES_NOTICES.DELETE);
      return removerCompetencia;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - REMOVE');
      throw error;
    }
  }
}
