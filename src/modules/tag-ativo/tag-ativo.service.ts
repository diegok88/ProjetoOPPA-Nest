import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateTagAtivoDto } from './dto/create-tag-ativo.dto';
import { UpdateTagAtivoDto } from './dto/update-tag-ativo.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { TagAtivo, TagAtivoRelacoes } from './entities/tag-ativo.entity';
import { TYPES_NOTICES } from '@/utils/types-notices.cosnt';
import { Acao, Prisma } from '@/generated/prisma/client';
import { QueryTagAtivoFilterDto } from './dto/query-tag-ativo.dto';
import { Contador } from '@/interfaces/counter.interface';
import { TenantContextService } from '@/auth/tenant-context/tenant-context.service';

@Injectable()
export class TagAtivoService {
  private logger = new Logger(TagAtivoService.name);

  constructor(
    private prisma: PrismaService,
    private readonly tenantContext: TenantContextService,
  ) {}

  async create(
    create: CreateTagAtivoDto,
    empresaId: string,
  ): Promise<TagAtivo> {
    try {
      /* Busca o codigo da empresa cadastrante */
      const empresa = await this.prisma.client.empresa.findUnique({
        where: { id: empresaId },
        select: { codigo: true },
      });
      /* Busca o codigo do ativo */
      const ativo = await this.prisma.client.ativo.findUnique({
        where: { id: create.ativoId },
        select: { codigo: true, descricao: true },
      });
      /* Busca o total de tags do ativo */
      const codTag = await this.prisma.client.tagAtivo.count();
      /* Busca o total de tags do ativo */
      const desTag: string = `${ativo.descricao.slice(0, 2)}${empresa.codigo}${ativo.codigo}${codTag}`;

      const criar = await this.prisma.client.tagAtivo.create({
        data: { ...create, descricao: desTag },
      });
      this.logger.log(TYPES_NOTICES.CREATE);
      return criar;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - CREATE');
      throw error;
    }
  }

  async findAll(
    query: QueryTagAtivoFilterDto,
    tx?: Prisma.TransactionClient,
  ): Promise<TagAtivoRelacoes[]> {
    try {
      const client = tx ?? this.prisma.client;

      const { campos, ...filtros } = query ?? {};

      const condicao: Prisma.TagAtivoWhereInput = {};
      if (query.descricao) condicao.descricao = query.descricao;
      if (query.ativoId) condicao.ativoId = query.ativoId;
      if (query.empresaId) condicao.ativo = { empresaId: query.empresaId };
      if (query.status !== undefined) condicao.status = query.status;

      const selecao = await this.buildSelect(campos);

      const opcoes: Prisma.TagAtivoFindManyArgs = {
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
                alocacaoTagAtivo: true,
              }
            : filtros.incluir === 'alocacaoTagAtivo'
              ? { alocacaoTagAtivo: true }
              : { ativo: true };
      }

      const listar: TagAtivoRelacoes[] = await client.tagAtivo.findMany(opcoes);

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

      const grupos = await this.prisma.tagAtivo.groupBy({
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

  async findOne(id: string, tx?: Prisma.TransactionClient): Promise<TagAtivo> {
    try {
      const client = tx ?? this.prisma.client;
      const buscar = await client.tagAtivo.findUnique({
        where: { id: id },
        include: { ativo: true },
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
    updateTagAtivoDto: UpdateTagAtivoDto,
  ): Promise<TagAtivo> {
    try {
      const atualizarTag = await this.prisma.client.$transaction(
        async (tx: any) => {
          await this.findOne(id, tx);

          const atualizar = await tx.tagAtivo.update({
            where: { id: id },
            data: updateTagAtivoDto,
          });

          return atualizar;
        },
      );

      this.logger.log(TYPES_NOTICES.UPDATE);
      return atualizarTag;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - UPDATE');
      throw error;
    }
  }

  async active(id: string): Promise<TagAtivo> {
    try {
      const ativarTag = await this.prisma.client.$transaction(
        async (tx: any) => {
          const verificar = await this.findOne(id, tx);

          if (verificar.status) {
            this.logger.warn(TYPES_NOTICES.IS_ACTIVE);
            throw new UnauthorizedException(TYPES_NOTICES.IS_ACTIVE);
          }

          const ativar = await tx.tagAtivo.update({
            where: { id: id },
            data: { status: true, _auditAction: Acao.ACTIVE },
          });

          return ativar;
        },
      );

      this.logger.log(TYPES_NOTICES.ACTIVE);
      return ativarTag;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - DEACTIVE');
      throw error;
    }
  }

  async deactive(id: string): Promise<TagAtivo> {
    try {
      const inativarTag = await this.prisma.client.$transaction(
        async (tx: any) => {
          const verificar = await this.findOne(id, tx);

          if (!verificar.status) {
            this.logger.warn(TYPES_NOTICES.IS_DEACTIVE);
            throw new UnauthorizedException(TYPES_NOTICES.IS_DEACTIVE);
          }

          const inativar = await tx.tagAtivo.update({
            where: { id: id },
            data: { status: false, _auditAction: Acao.DEACTIVATE },
          });

          return inativar;
        },
      );

      this.logger.log(TYPES_NOTICES.DEACTIVE);
      return inativarTag;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - DEACTIVE');
      throw error;
    }
  }

  async remove(id: string): Promise<TagAtivo> {
    try {
      const removerTag = await this.prisma.client.$transaction(
        async (tx: any) => {
          const verificar = await this.findOne(id, tx);

          if (verificar.status) {
            this.logger.warn(TYPES_NOTICES.UNAUTHORIZED);
            throw new UnauthorizedException(TYPES_NOTICES.UNAUTHORIZED);
          }

          const remover = await tx.tagAtivo.delete({
            where: { id: id },
          });

          return remover;
        },
      );

      this.logger.log(TYPES_NOTICES.DELETE);
      return removerTag;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - REMOVE');
      throw error;
    }
  }

  // METODO DE CONSULTA DINAMICA
  private readonly allowedTagAtivoFiels = [
    'id',
    'codigo',
    'descricao',
    'ativoId',
    'senha',
    'status',
  ];

  private async buildSelect(
    campos?: string,
  ): Promise<Record<string, true> | undefined> {
    if (!campos) return undefined;

    const campoArray = campos.split(',').map((c) => c.trim());
    const selecaoObj = {};

    for (const campo of campoArray) {
      if (this.allowedTagAtivoFiels.includes(campo)) {
        selecaoObj[campo] = true;
      }
    }

    return Object.keys(selecaoObj).length > 0 ? selecaoObj : undefined;
  }
}
