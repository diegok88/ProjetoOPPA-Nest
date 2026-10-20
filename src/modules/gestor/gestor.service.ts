import { TenantContextService } from '@/auth/tenant-context/tenant-context.service';
import { Prisma } from '@/generated/prisma/client';
import { Acao } from '@/generated/prisma/enums';
import { PrismaService } from '@/prisma/prisma.service';
import { TYPES_NOTICES } from '@/utils/types-notices.cosnt';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { QueryGestorFilterDto } from './dto/query-gestor.dto';
import {
  Gestor,
  GestorListagem,
  GestorRelacoes,
  GestorUsuario,
} from './entities/gestor.entity';
import { ResponseGestorRelacoesParcialDto } from './dto/response-gestor.dto';
import { Contador } from '@/interfaces/counter.interface';
import { PerfilService } from '../perfil/perfil.service';
import { ROLES } from '@/auth/guards/roles.const';

@Injectable()
export class GestorService {
  private logger = new Logger(GestorService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly perfilService: PerfilService,
    private readonly tenantContext: TenantContextService,
  ) {}

  /* 
    CRIAR GESTOR ATRAVES DE UMA LISTA:
    - função interna em conjunto com a competencia setorial.
    - somente autorizado para gestores de equipe
  */

  async createAll(
    ids: Array<string>,
    gestorId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<Prisma.BatchPayload> {
    try {
      const client = tx ?? this.prisma.client;

      const criar = await client.gestor.createMany({
        data: ids.map((colaboradorId) => ({ colaboradorId, gestorId })),
        skipDuplicates: true,
      });

      return criar;
    } catch (error) {
      this.logger.log(TYPES_NOTICES.SERVICE_FAILURE, ' - CREATEALL');
      throw error;
    }
  }

  /* 
    LISTAR GESTORES: 
    - lista todos os registros.
    - possui um filtro se necessario.
  */
  async findAll(
    query: QueryGestorFilterDto,
    tx?: Prisma.TransactionClient,
  ): Promise<GestorListagem[]> {
    try {
      const ctx = this.tenantContext.getStore()!;

      const buscarPerfil = await this.perfilService.findOne(ctx.perfil, tx);
      const perfil = `${buscarPerfil.descricao} - ${buscarPerfil.nivel}`;

      const client = tx ?? this.prisma.client;

      const { campos, ...filtros } = query ?? {};

      this.logger.debug(query);

      const condicao: Prisma.GestorWhereInput = {};
      if (filtros.colaboradorId) condicao.colaboradorId = filtros.colaboradorId;
      if (filtros.gestorId) condicao.gestorId = filtros.gestorId;
      if (filtros.status) condicao.status = filtros.status;
      if (filtros.gestor === true) condicao.gestorId = ctx.user;
      else if (filtros.gestor === false) {
        if (perfil === ROLES.ADN1) {
          const filtroUsuario: Prisma.GestorWhereInput['gestor'] = {};
          if (!filtroUsuario.empresaId) filtroUsuario.empresaId = ctx.empresa;
          if (Object.keys(filtroUsuario).length > 0)
            condicao.gestor = filtroUsuario;
        }
      }

      this.logger.debug(condicao);

      const selecao = await this.buildSelect(campos);

      const INCLUDES: Record<string, Prisma.GestorInclude> = {
        todos_relacoes: { colaborador: true, gestor: true },
        todos_parcial: {
          colaborador: { select: { id: true, cracha: true, nome: true } },
          gestor: { select: { id: true, cracha: true, nome: true } },
        },
        colaborador_parcial: {
          colaborador: { select: { id: true, cracha: true, nome: true } },
        },
        gestor_usuario: {
          colaborador: {
            include: {
              perfil: { select: { descricao: true, nivel: true } },
              empresa: { select: { razaoSocial: true } },
            },
          },
          gestor: { select: { cracha: true, nome: true } },
        },
      };

      const opcoes: Prisma.GestorFindManyArgs = {
        where: condicao,
        orderBy: { colaborador: { cracha: 'asc' } },
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

      const listar: Gestor[] = await client.gestor.findMany(opcoes);

      if (listar.length === 0) {
        this.logger.warn(TYPES_NOTICES.EMPTY_LIST);
      }

      this.logger.log(TYPES_NOTICES.FIND_ALL);
      return listar;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - findall');
      throw error;
    }
  }

  /* 
    LISTAR GESTORES APENAS TESTE: 
    - lista todos os registro de colaboradores e seus gestores com relação de entidades.
    - possui um filtro se necessario.
  */
  async findAllGestor(query: QueryGestorFilterDto): Promise<GestorRelacoes[]> {
    try {
      const condicao: Prisma.GestorWhereInput = {};
      if (query.colaboradorId) condicao.colaboradorId = query.colaboradorId;
      if (query.gestorId) condicao.gestorId = query.gestorId;
      if (query.status) condicao.status = query.status;

      condicao.gestorId = this.tenantContext.getStore()?.user;

      const listar = await this.prisma.gestor.findMany({
        where: condicao,
        include: {
          colaborador: true,
          gestor: true,
        },
      });

      if (listar.length === 0) {
        this.logger.warn(TYPES_NOTICES.EMPTY_LIST);
      }

      this.logger.log(TYPES_NOTICES.FIND_ALL);
      return listar;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - findall');
      throw error;
    }
  }

  /* 
    LISTAR GESTORES APENAS TESTE: 
    - lista todos os registro de colaboradores e seus gestores com relação de entidades.
    - possui um filtro se necessario.
    - apenas retorna os dados escolhidos
  */
  async findAllGestorParcial(
    query: QueryGestorFilterDto,
  ): Promise<ResponseGestorRelacoesParcialDto[]> {
    try {
      const condicao: Prisma.GestorWhereInput = {};
      if (query.colaboradorId) condicao.colaboradorId = query.colaboradorId;
      if (query.gestorId) condicao.gestorId = query.gestorId;
      if (query.status !== undefined) condicao.status = query.status;

      condicao.gestorId = this.tenantContext.getStore()?.user;

      const listar = await this.prisma.gestor.findMany({
        where: condicao,
        include: {
          colaborador: { select: { id: true, cracha: true, nome: true } },
          gestor: { select: { id: true, cracha: true, nome: true } },
        },
        orderBy: { colaborador: { nome: 'asc' } },
      });

      if (listar.length === 0) {
        this.logger.warn(TYPES_NOTICES.EMPTY_LIST);
      }

      this.logger.log(TYPES_NOTICES.FIND_ALL);
      return listar;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - findall');
      throw error;
    }
  }

  /* FUNÇÃO CONTADOR DE REGISTROS SENDO O TOTAL, ATIVOS E INATIVOS */
  async counter(): Promise<Contador> {
    try {
      const ctx = this.tenantContext.getStore()!;

      const grupos = await this.prisma.gestor.groupBy({
        by: ['status'],
        where: { gestorId: ctx.user },
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

  /* 
    BUSCAR GESTOR POR ID:
    - busca o registro do gestor atraves do id.
  */
  async findOne(id: string, tx?: Prisma.TransactionClient): Promise<Gestor> {
    try {
      const client = tx ?? this.prisma.client;

      const buscar = await client.gestor.findUnique({
        where: { id: id },
      });

      if (!buscar) {
        this.logger.warn(TYPES_NOTICES.NOT_FOUND);
        throw new NotFoundException(TYPES_NOTICES.NOT_FOUND);
      }

      this.logger.log(TYPES_NOTICES.FIND_ONE);
      return buscar;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.FIND_ONE, ' - findone');
      throw error;
    }
  }

  async findOneUser(id: string): Promise<GestorUsuario> {
    try {
      const buscar = await this.prisma.gestor.findUnique({
        where: { id: id },
        include: {
          colaborador: {
            include: {
              perfil: { select: { descricao: true, nivel: true } },
              empresa: { select: { razaoSocial: true } },
            },
          },
          gestor: { select: { id: true, cracha: true, nome: true } },
        },
      });

      if (!buscar) {
        this.logger.warn(TYPES_NOTICES.NOT_FOUND);
        throw new NotFoundException(TYPES_NOTICES.NOT_FOUND);
      }

      return buscar as GestorUsuario;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.FIND_ONE, ' - FindOneUser');
      throw error;
    }
  }
  /* 
    BUSCA ID: 
    - função que busca o id do registro atraves de parametros.
    - função interna
  */
  async findId(
    colId: string,
    gesId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<GestorRelacoes> {
    try {
      const client = tx ?? this.prisma.client;

      const buscar = await client.gestor.findFirst({
        where: {
          colaboradorId: colId,
          gestorId: gesId,
        },
        include: {
          colaborador: true,
          gestor: true,
        },
      });

      if (!buscar) {
        this.logger.warn(TYPES_NOTICES.NOT_FOUND);
        throw new NotFoundException(TYPES_NOTICES.NOT_FOUND);
      }

      this.logger.log(TYPES_NOTICES.FIND_ONE);
      return buscar;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - findid');
      throw error;
    }
  }

  /* 
    ATIVAR GESTORES:
    - ativa todos os gestores de acordo com a empresa que os mesmos pertencem.
  */
  async activeAll(
    ids: Array<string>,
    tx?: Prisma.TransactionClient,
  ): Promise<Prisma.BatchPayload> {
    try {
      const client = tx ?? this.prisma.client;

      const ativar = await client.gestor.updateMany({
        where: { colaboradorId: { in: ids } },
        data: { status: true, _auditAction: Acao.ACTIVE },
      });

      this.logger.log(TYPES_NOTICES.ACTIVE_MANY);
      return ativar;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - activeall');
      throw error;
    }
  }

  /* 
    INATIVAR GESTORES:
    - inativa todos os gestores de acordo com a empresa que os mesmos pertencem.
  */
  async deactiveAll(
    ids: Array<string>,
    tx?: Prisma.TransactionClient,
  ): Promise<Prisma.BatchPayload> {
    try {
      const client = tx ?? this.prisma.client;

      const inativar = await client.gestor.updateMany({
        where: { colaboradorId: { in: ids } },
        data: { status: false, _auditAction: Acao.DEACTIVATE },
      });

      this.logger.log(TYPES_NOTICES.DEACTIVE_MANY);
      return inativar;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - deactiveall');
      throw error;
    }
  }

  /* 
    REMOVER TODOS OS GESTORES:
    - função interna.
    - usada em conjunto com a função de remoção de usuario, de acordo com a remoção da empresa.
  */
  async removeAll(
    ids: Array<string>,
    tx?: Prisma.TransactionClient,
  ): Promise<Prisma.BatchPayload> {
    try {
      const client = tx ?? this.prisma.client;

      const remover = await client.gestor.deleteMany({
        where: { colaboradorId: { in: ids } },
      });

      this.logger.log(TYPES_NOTICES.DELETE_MANY);
      return remover;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - removeall');
      throw error;
    }
  }

  private readonly allowedGestorFiels = [
    'id',
    'colaboradorId',
    'gestorId',
    'status',
  ];

  private async buildSelect(
    campos?: string,
  ): Promise<Record<string, true> | undefined> {
    if (!campos) return undefined;

    const campoArray = campos.split(',').map((c) => c.trim());
    const selecaoObj = {};

    for (const campo of campoArray) {
      if (this.allowedGestorFiels.includes(campo)) {
        selecaoObj[campo] = true;
      }
    }

    return Object.keys(selecaoObj).length > 0 ? selecaoObj : undefined;
  }
}
