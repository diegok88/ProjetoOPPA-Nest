import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateFalhaDto } from './dto/create-falha.dto';
import { UpdateFalhaDto } from './dto/update-falha.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { TYPES_NOTICES } from '@/utils/types-notices.cosnt';

import { Acao, Prisma } from '@/generated/prisma/client';
import { QueryFalhasFilterDto } from './dto/query-falhas.dto';
import { Falhas, FalhasRelacoes } from './entities/falha.entity';
import { Contador } from '@/interfaces/counter.interface';
import { TenantContextService } from '@/auth/tenant-context/tenant-context.service';

@Injectable()
export class FalhasService {
  private logger = new Logger(FalhasService.name);

  constructor(
    private prisma: PrismaService,
    private tenantContext: TenantContextService,
  ) {}

  async create(create: CreateFalhaDto): Promise<Falhas> {
    try {
      const criar = await this.prisma.client.falhas.create({
        data: create,
      });
      this.logger.log(TYPES_NOTICES.CREATE);
      return criar;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - CREATE');
      throw error;
    }
  }

  async findAll(
    query: QueryFalhasFilterDto,
    tx?: Prisma.TransactionClient,
  ): Promise<Falhas[]> {
    try {
      const client = tx ?? this.prisma.client;

      const { campos, ...filtros } = query ?? {};

      const condicao: Prisma.FalhasWhereInput = {};
      if (filtros.codigo) condicao.codigo = filtros.codigo;
      if (filtros.descricao) condicao.descricao = filtros.descricao;
      if (filtros.ativoId) condicao.ativoId = filtros.ativoId;
      if (filtros.direcionamentoId)
        condicao.direcionamentoId = filtros.direcionamentoId;
      if (filtros.status !== undefined) condicao.status = filtros.status;

      // filtros por colunas da relação Ativo
      const filtroAtivo: Prisma.FalhasWhereInput['ativo'] = {};
      if (filtros.empresaId) filtroAtivo.empresaId = filtros.empresaId;
      if (Object.keys(filtroAtivo).length > 0) condicao.ativo = filtroAtivo;

      const selecao = await this.buildSelect(campos);

      const opcoes: Prisma.FalhasFindManyArgs = {
        where: condicao,
        orderBy: { codigo: 'asc' },
      };

      if (campos?.length) {
        opcoes.select = selecao;
      } else {
        opcoes.include =
          filtros.incluir === 'todos_relacoes'
            ? {
                ativo: true,
                perfil: true,
              }
            : filtros.incluir === 'perfil'
              ? { perfil: true }
              : { ativo: true };
      }

      const listar: Falhas[] = await client.falhas.findMany(opcoes);

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

  /* FUNÇÃO CONTADOR DE REGISTROS: TOTAL, ATIVOS E INATIVOS EM UMA ÚNICA QUERY */
  async counter(): Promise<Contador> {
    try {
      const ctx = this.tenantContext.getStore()?.empresa;

      const grupos = await this.prisma.falhas.groupBy({
        by: ['status'],
        where: { ativo: { empresaId: ctx } },
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
  ): Promise<FalhasRelacoes> {
    try {
      const client = tx ?? this.prisma.client;
      const buscar = await client.falhas.findUnique({
        where: { id: id },
        include: { ativo: true, perfil: true },
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

  async update(id: string, updateFalhaDto: UpdateFalhaDto): Promise<Falhas> {
    try {
      const atualizarFalha = await this.prisma.client.$transaction(
        async (tx: any) => {
          await this.findOne(id, tx);

          const atualizar = await tx.falhas.update({
            where: { id: id },
            data: updateFalhaDto,
          });

          return atualizar;
        },
      );

      this.logger.log(TYPES_NOTICES.UPDATE);
      return atualizarFalha;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - UPDATE');
      throw error;
    }
  }

  async active(id: string): Promise<Falhas> {
    try {
      const ativarFalha = await this.prisma.client.$transaction(
        async (tx: any) => {
          const verificar = await this.findOne(id, tx);

          if (verificar.status) {
            this.logger.warn(TYPES_NOTICES.IS_ACTIVE);
            throw new UnauthorizedException(TYPES_NOTICES.IS_ACTIVE);
          }

          const ativar = await tx.falhas.update({
            where: { id: id },
            data: { status: true, _auditAction: Acao.ACTIVE },
          });

          return ativar;
        },
      );

      this.logger.log(TYPES_NOTICES.DEACTIVE);
      return ativarFalha;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - DEACTIVE');
      throw error;
    }
  }

  async deactive(id: string): Promise<Falhas> {
    try {
      const inativarFalha = await this.prisma.client.$transaction(
        async (tx: any) => {
          const verificar = await this.findOne(id, tx);

          if (!verificar.status) {
            this.logger.warn(TYPES_NOTICES.IS_DEACTIVE);
            throw new UnauthorizedException(TYPES_NOTICES.IS_DEACTIVE);
          }

          const inativar = await tx.falhas.update({
            where: { id: id },
            data: { status: false, _auditAction: Acao.DEACTIVATE },
          });

          return inativar;
        },
      );

      this.logger.log(TYPES_NOTICES.DEACTIVE);
      return inativarFalha;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - DEACTIVE');
      throw error;
    }
  }

  async remove(id: string): Promise<Falhas> {
    try {
      const removerFalha = await this.prisma.client.$transaction(
        async (tx: any) => {
          const verificar = await this.findOne(id, tx);

          if (verificar.status) {
            this.logger.warn(TYPES_NOTICES.UNAUTHORIZED);
            throw new UnauthorizedException(TYPES_NOTICES.UNAUTHORIZED);
          }

          const remover = await tx.falhas.delete({
            where: { id: id },
          });

          return remover;
        },
      );

      this.logger.log(TYPES_NOTICES.DELETE);
      return removerFalha;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - REMOVE');
      throw error;
    }
  }

  // METODO DE CONSULTA DINAMICA
  private readonly allowedFalhasFiels = [
    'id',
    'codigo',
    'descricao',
    'ativoId',
    'direcionamentoId',
    'status',
  ];

  private async buildSelect(
    campos?: string,
  ): Promise<Record<string, true> | undefined> {
    if (!campos) return undefined;

    const campoArray = campos.split(',').map((c) => c.trim());
    const selecaoObj = {};

    for (const campo of campoArray) {
      if (this.allowedFalhasFiels.includes(campo)) {
        selecaoObj[campo] = true;
      }
    }

    return Object.keys(selecaoObj).length > 0 ? selecaoObj : undefined;
  }
}
