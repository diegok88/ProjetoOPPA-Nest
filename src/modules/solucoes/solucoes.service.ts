import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateSolucoesDto } from './dto/create-solucoes.dto';
import { UpdateSolucoeDto } from './dto/update-solucoes.dto';
import { PrismaService } from '@/prisma/prisma.service';
import {
  Solucoes,
  SolucoesListagem,
  SolucoesRelacoes,
} from './entities/solucoes.entity';
import { TYPES_NOTICES } from '@/utils/types-notices.cosnt';
import { QuerySolucoesFilterDto } from './dto/query-solucoes.dto';
import { Acao, Prisma } from '@/generated/prisma/client';
import { Contador } from '@/interfaces/counter.interface';
import { TenantContextService } from '@/auth/tenant-context/tenant-context.service';

@Injectable()
export class SolucoesService {
  private logger = new Logger(SolucoesService.name);

  constructor(
    private prisma: PrismaService,
    private tenantContext: TenantContextService,
  ) {}

  async create(createSolucoesDto: CreateSolucoesDto): Promise<Solucoes> {
    try {
      const criar = await this.prisma.client.solucoes.create({
        data: { ...createSolucoesDto },
      });
      this.logger.log(TYPES_NOTICES.CREATE);
      return criar;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - CREATE');
      throw error;
    }
  }

  async findAll(
    query: QuerySolucoesFilterDto,
    tx?: Prisma.TransactionClient,
  ): Promise<SolucoesListagem[]> {
    try {
      const client = tx ?? this.prisma.client;

      const { campos, ...filtros } = query ?? {};

      const condicao: Prisma.SolucoesWhereInput = {};
      if (filtros.falhaId) condicao.falhaId = filtros.falhaId;
      if (filtros.direcionamentoId) {
        condicao.direcionamentoId = filtros.direcionamentoId;
      }
      if (filtros.descricao) condicao.descricao = filtros.descricao;
      if (filtros.status !== undefined) condicao.status = filtros.status;

      const filtroFalha: Prisma.SolucoesWhereInput['falha'] = {};
      if (filtros.ativoId) filtroFalha.ativoId = filtros.ativoId;
      if (Object.keys(filtroFalha).length > 0) condicao.falha = filtroFalha;

      const selecao = await this.buildSelect(campos);

      const INCLUDES: Record<string, Prisma.SolucoesInclude> = {
        todos_relacoes: { falha: true, perfil: true },
        perfil: { perfil: true },
        falha: { falha: true },
        perfil_parcial: {
          perfil: { select: { codigo: true, descricao: true } },
        },
        falha_parcial: { falha: { select: { codigo: true, descricao: true } } },
      };

      const opcoes: Prisma.SolucoesFindManyArgs = {
        where: condicao,
        orderBy: { codigo: 'asc' },
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

      const listar: Solucoes[] = await client.solucoes.findMany(opcoes);

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

  async counter(): Promise<Contador> {
    try {
      const ctx = this.tenantContext.getStore()?.empresa;

      const grupos = await this.prisma.solucoes.groupBy({
        by: ['status'],
        where: { falha: { ativo: { empresaId: ctx } } },
        _count: { _all: true },
      });

      const ativos = grupos.find((g) => g.status === true)?._count._all ?? 0;
      const inativos = grupos.find((g) => g.status === false)?._count._all ?? 0;

      this.logger.log(TYPES_NOTICES.COUNTER);
      return { total: ativos + inativos, ativos, inativos };
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - COUNTER');
      throw error;
    }
  }

  async findOne(
    id: string,
    tx?: Prisma.TransactionClient,
  ): Promise<SolucoesListagem> {
    try {
      const client = tx ?? this.prisma.client;

      const buscar = await client.solucoes.findUnique({
        where: { id: id },
        include: { falha: true, perfil: true },
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
    updateSolucoeDto: UpdateSolucoeDto,
  ): Promise<Solucoes> {
    try {
      const atualizarSolucao = await this.prisma.client.$transaction(
        async (tx: any) => {
          await this.findOne(id, tx);

          const atualizar = await tx.solucoes.update({
            where: { id: id },
            data: updateSolucoeDto,
          });

          return atualizar;
        },
      );

      this.logger.log(TYPES_NOTICES.UPDATE);
      return atualizarSolucao;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - UPDATE');
      throw error;
    }
  }

  async active(id: string): Promise<Solucoes> {
    try {
      const ativarSolucao = await this.prisma.client.$transaction(
        async (tx: any) => {
          const verificar = await this.findOne(id, tx);

          if (verificar.status) {
            this.logger.warn(TYPES_NOTICES.IS_ACTIVE);
            throw new UnauthorizedException(TYPES_NOTICES.IS_ACTIVE);
          }

          const ativar = await tx.solucoes.update({
            where: { id: id },
            data: { status: true, _auditAction: Acao.ACTIVE },
          });

          return ativar;
        },
      );

      this.logger.log(TYPES_NOTICES.ACTIVE);
      return ativarSolucao;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - ACTIVE');
      throw error;
    }
  }

  async deactive(id: string): Promise<Solucoes> {
    try {
      const inativarSolucao = await this.prisma.client.$transaction(
        async (tx: any) => {
          const verificar = await this.findOne(id, tx);

          if (!verificar.status) {
            this.logger.warn(TYPES_NOTICES.IS_DEACTIVE);
            throw new UnauthorizedException(TYPES_NOTICES.IS_DEACTIVE);
          }

          const inativar = await tx.solucoes.update({
            where: { id: id },
            data: { status: false, _auditAction: Acao.DEACTIVATE },
          });

          return inativar;
        },
      );

      this.logger.log(TYPES_NOTICES.DEACTIVE);
      return inativarSolucao;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - DEACTIVE');
      throw error;
    }
  }

  async remove(id: string): Promise<Solucoes> {
    try {
      const removerSolucao = await this.prisma.client.$transaction(
        async (tx: any) => {
          const verificar = await this.findOne(id, tx);

          if (verificar.status) {
            this.logger.warn(TYPES_NOTICES.UNAUTHORIZED);
            throw new UnauthorizedException(TYPES_NOTICES.UNAUTHORIZED);
          }

          const remover = await tx.solucoes.delete({
            where: { id: id },
          });

          return remover;
        },
      );

      this.logger.log(TYPES_NOTICES.DELETE);
      return removerSolucao;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - REMOVE');
      throw error;
    }
  }

  private readonly allowedSolucoesFiels = [
    'id',
    'codigo',
    'falhaId',
    'direcionamentoId',
    'descricao',
    'status',
  ];

  private async buildSelect(
    campos?: string,
  ): Promise<Record<string, true> | undefined> {
    if (!campos) return undefined;

    const campoArray = campos.split(',').map((c) => c.trim());
    const selecaoObj = {};

    for (const campo of campoArray) {
      if (this.allowedSolucoesFiels.includes(campo)) {
        selecaoObj[campo] = true;
      }
    }

    return Object.keys(selecaoObj).length > 0 ? selecaoObj : undefined;
  }
}
