import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateAtivoDto } from './dto/create-ativo.dto';
import { UpdateAtivoDto } from './dto/update-ativo.dto';
import { PrismaService } from '@/prisma/prisma.service';
import {
  Ativo,
  AtivoRelacoes,
  AtivoRelacoesParcial,
} from './entities/ativo.entity';
import { TYPES_NOTICES } from '@/utils/types-notices.cosnt';
import { QueryAtivoFilterDto } from './dto/query-ativo.dto';
import { Acao, Prisma } from '@/generated/prisma/client';
import { TenantContextService } from '@/auth/tenant-context/tenant-context.service';
import { Contador } from '@/interfaces/counter.interface';

@Injectable()
export class AtivoService {
  private logger = new Logger(AtivoService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContextService,
  ) {}

  async create(
    createAtivoDto: CreateAtivoDto,
    empresa: string,
  ): Promise<Ativo> {
    try {
      const criar = await this.prisma.client.ativo.create({
        data: { ...createAtivoDto, empresaId: empresa },
      });
      this.logger.log(TYPES_NOTICES.CREATE);
      return criar;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - CREATE');
      throw error;
    }
  }

  async findAll(
    query: QueryAtivoFilterDto,
    tx?: Prisma.TransactionClient,
  ): Promise<AtivoRelacoes[]> {
    try {
      const ctx = this.tenantContext.getStore()!;

      const client = tx ?? this.prisma.client;

      const { campos, ...filtros } = query ?? {};

      const condicao: Prisma.AtivoWhereInput = {};
      if (query.codigo) condicao.codigo = query.codigo;
      if (query.descricao) condicao.descricao = query.descricao;
      if (query.modelo) condicao.modelo = query.modelo;
      if (query.fabricante) condicao.fabricante = query.fabricante;
      if (query.ano) condicao.ano = query.ano;
      if (query.setorId) condicao.setorId = query.setorId;
      if (query.empresaId) condicao.empresaId = query.empresaId;
      if (query.status) condicao.status = query.status;

      if (query.gestor === true) condicao.empresaId = ctx.empresa;

      const selecao = await this.buildSelect(campos);

      const opcoes: Prisma.AtivoFindManyArgs = {
        where: condicao,
        orderBy: { codigo: 'asc' },
      };

      if (campos?.length) {
        opcoes.select = selecao;
      } else {
        opcoes.include =
          filtros.incluir === 'todos_relacoes'
            ? {
                setor: true,
                empresa: true,
                competenciaAtivo: true,
                tagAtivo: true,
                falhaAtivo: true,
              }
            : filtros.incluir === 'empresa'
              ? { empresa: true }
              : filtros.incluir === 'competenciaAtivo'
                ? { competenciaAtivo: true }
                : filtros.incluir === 'falhaAtivo'
                  ? { falhaAtivo: true }
                  : { tagAtivo: true };
      }

      const listar: AtivoRelacoes[] = await client.ativo.findMany(opcoes);

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

  /* FUNÇÃO QUE RETORNA OS ATIVOS 
  - apenas o que não foi atibuido ao colaborador.
  - requerida na competência operacional.
  */
  async findAssetsAvailable(
    ids: Array<string>,
  ): Promise<AtivoRelacoesParcial[]> {
    try {
      const ctx = this.tenantContext.getStore()!;

      const condicao: Prisma.AtivoWhereInput = {
        ...(ids.length ? { id: { notIn: ids } } : {}),
        empresaId: ctx.empresa,
      };

      const ativos = await this.prisma.client.ativo.findMany({
        where: condicao,
        select: { id: true, codigo: true, descricao: true, modelo: true },
      });

      return ativos;
    } catch (error) {
      this.logger.error(
        TYPES_NOTICES.SERVICE_FAILURE,
        ' - findAssetsAvailable()',
      );
      throw error;
    }
  }

  /* FUNÇÃO CONTADOR DE REGISTROS: TOTAL, ATIVOS E INATIVOS EM UMA ÚNICA QUERY */
  async counter(): Promise<Contador> {
    try {
      const ctx = this.tenantContext.getStore()?.empresa;

      const grupos = await this.prisma.ativo.groupBy({
        by: ['status'],
        where: { empresaId: ctx },
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
  ): Promise<AtivoRelacoes> {
    try {
      const client = tx ?? this.prisma.client;
      const buscar = await client.ativo.findUnique({
        where: { id: id },
        include: {
          falhaAtivo: true,
          tagAtivo: true,
          competenciaAtivo: true,
          empresa: true,
          setor: true,
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

  async update(id: string, updateAtivoDto: UpdateAtivoDto): Promise<Ativo> {
    try {
      const atualizarAtivo = await this.prisma.client.$transaction(
        async (tx: any) => {
          await this.findOne(id, tx);

          const atualizar = await tx.ativo.update({
            where: { id: id },
            data: updateAtivoDto,
          });

          return atualizar;
        },
      );

      this.logger.log(TYPES_NOTICES.UPDATE);
      return atualizarAtivo;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - UPDATE');
      throw error;
    }
  }

  async active(id: string): Promise<Ativo> {
    try {
      const ativarAtivo = await this.prisma.client.$transaction(
        async (tx: any) => {
          const verificar = await this.findOne(id, tx);

          if (verificar.status) {
            this.logger.warn(TYPES_NOTICES.IS_ACTIVE);
            throw new UnauthorizedException(TYPES_NOTICES.IS_ACTIVE);
          }

          const ativar = await tx.ativo.update({
            where: { id: id },
            data: { status: true, _auditAction: Acao.ACTIVE },
          });

          return ativar;
        },
      );

      this.logger.log(TYPES_NOTICES.ACTIVE);
      return ativarAtivo;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - ACTIVE');
      throw error;
    }
  }

  async deactive(id: string): Promise<Ativo> {
    try {
      const inativarAtivo = await this.prisma.client.$transaction(
        async (tx: any) => {
          const verificar = await this.findOne(id, tx);

          if (!verificar.status) {
            this.logger.warn(TYPES_NOTICES.IS_DEACTIVE);
            throw new UnauthorizedException(TYPES_NOTICES.IS_DEACTIVE);
          }

          const inativar = await tx.ativo.update({
            where: { id: id },
            data: { status: false, _auditAction: Acao.DEACTIVATE },
          });

          return inativar;
        },
      );

      this.logger.log(TYPES_NOTICES.DEACTIVE);
      return inativarAtivo;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - DEACTIVE');
      throw error;
    }
  }

  async remove(id: string): Promise<Ativo> {
    try {
      const removerAtivo = await this.prisma.client.$transaction(
        async (tx: any) => {
          const verificar = await this.findOne(id, tx);

          if (verificar.status) {
            this.logger.warn(TYPES_NOTICES.UNAUTHORIZED);
            throw new UnauthorizedException(TYPES_NOTICES.UNAUTHORIZED);
          }

          const remover = await tx.ativo.delete({
            where: { id: id },
          });

          return remover;
        },
      );

      this.logger.log(TYPES_NOTICES.DELETE);
      return removerAtivo;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - REMOVE');
      throw error;
    }
  }

  // METODO DE CONSULTA DINAMICA
  private readonly allowedAtivoFiels = [
    'id',
    'codigo',
    'descricao',
    'modelo',
    'fabricante',
    'ano',
    'empresaId',
    'status',
  ];

  private async buildSelect(
    campos?: string,
  ): Promise<Record<string, true> | undefined> {
    if (!campos) return undefined;

    const campoArray = campos.split(',').map((c) => c.trim());
    const selecaoObj = {};

    for (const campo of campoArray) {
      if (this.allowedAtivoFiels.includes(campo)) {
        selecaoObj[campo] = true;
      }
    }

    return Object.keys(selecaoObj).length > 0 ? selecaoObj : undefined;
  }
}
