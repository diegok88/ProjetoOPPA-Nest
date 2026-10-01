import { TenantContextService } from '@/auth/tenant-context/tenant-context.service';
import { Prisma } from '@/generated/prisma/client';
import { Acao } from '@/generated/prisma/enums';
import { PrismaService } from '@/prisma/prisma.service';
import { TYPES_NOTICES } from '@/utils/types-notices.cosnt';
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { QueryGestorFilterDto } from './dto/query-gestor.dto';
import {
  Gestor,
  GestorComRelacoes,
  GestorRelacoes,
  GestorUsuario,
} from './entities/gestor.entity';
import { ResponseGestorRelacoesParcialDto } from './dto/response-gestor.dto';
import { Contador } from '@/interfaces/counter.interface';

@Injectable()
export class GestorService {
  private logger = new Logger(GestorService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContextService,
  ) {}

  private getCurrentUser() {
    const user = this.tenantContext.getStore();
    if (!user) {
      this.logger.warn(TYPES_NOTICES.UNAUTHORIZED);
      throw new UnauthorizedException(TYPES_NOTICES.UNAUTHORIZED);
    }
    return user;
  }

  /* 
    CRIAR GESTOR:
    - função interna.
    - somente autorizado para gestores de equipe
  */
  async create(
    usuarioid: string,
    tx?: Prisma.TransactionClient,
  ): Promise<Gestor> {
    try {
      const autenticado = this.getCurrentUser();
      const client = tx ?? this.prisma.client;

      const criar = await client.gestor.create({
        data: {
          colaboradorId: usuarioid,
          gestorId: autenticado.user,
        },
      });

      this.logger.log(TYPES_NOTICES.CREATE);
      return criar;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - create');
      throw error;
    }
  }

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
  ): Promise<Gestor[]> {
    try {
      const client = tx ?? this.prisma.client;

      const condicao: Prisma.GestorWhereInput = {};
      if (query.colaboradorId) condicao.colaboradorId = query.colaboradorId;
      if (query.gestorId) condicao.gestorId = query.gestorId;
      if (query.status) condicao.status = query.status;

      const listar = await client.gestor.findMany({
        where: condicao,
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
  */
  async findAllGestor(query: QueryGestorFilterDto): Promise<GestorRelacoes[]> {
    try {
      const condicao: Prisma.GestorWhereInput = {};
      if (query.colaboradorId) condicao.colaboradorId = query.colaboradorId;
      if (query.gestorId) condicao.gestorId = query.gestorId;
      if (query.status) condicao.status = query.status;

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
      const ctx = this.tenantContext.getStore()?.user;

      const total = await this.prisma.gestor.count({
        where: { gestorId: ctx },
      });
      const ativos = await this.prisma.gestor.count({
        where: { gestorId: ctx, status: true },
      });
      const inativos = await this.prisma.gestor.count({
        where: { gestorId: ctx, status: false },
      });

      this.logger.log(TYPES_NOTICES.COUNTER);
      return { total, ativos, inativos };
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
    INATIVAR GESTOR PELO ID: 
    - função interna.
    - inativa o gestor em conjunto com a inativação do usuario.
  */
  async active(id: string, tx?: Prisma.TransactionClient): Promise<Gestor> {
    try {
      const client = tx ?? this.prisma.client;

      const autenticado = this.getCurrentUser();
      const buscar = await this.findId(id, autenticado.user, client);

      if (buscar.status) {
        this.logger.warn(TYPES_NOTICES.IS_ACTIVE);
        throw new BadRequestException(TYPES_NOTICES.IS_ACTIVE);
      }

      const ativar = await client.gestor.update({
        where: { id: buscar.id },
        data: {
          status: true,
          _auditAction: Acao.ACTIVE,
        },
      });

      this.logger.log(TYPES_NOTICES.ACTIVE);
      return ativar;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - active');
      throw error;
    }
  }
  /* 
    INATIVAR GESTOR PELO ID: 
    - função interna.
    - inativa o gestor em conjunto com a inativação do usuario.
  */
  async deactive(id: string, tx?: Prisma.TransactionClient): Promise<Gestor> {
    try {
      const client = tx ?? this.prisma.client;

      const autenticado = this.getCurrentUser();
      const buscar = await this.findId(id, autenticado.user, client);

      if (!buscar.status) {
        this.logger.warn(TYPES_NOTICES.IS_DEACTIVE);
        throw new BadRequestException(TYPES_NOTICES.IS_DEACTIVE);
      }

      const inativar = await client.gestor.update({
        where: { id: buscar.id },
        data: {
          status: false,
          _auditAction: Acao.DEACTIVATE,
        },
      });

      this.logger.log(TYPES_NOTICES.DEACTIVE);
      return inativar;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - deactive');
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
    REMOVER GESTOR PELO ID:
    - função interna.
    - usada em conjunto com a função de remoção de usuario.
  */
  async remove(
    id: string,
    tx?: Prisma.TransactionClient,
  ): Promise<Prisma.BatchPayload> {
    try {
      const client = tx ?? this.prisma.client;

      const remover = await client.gestor.deleteMany({
        where: { colaboradorId: id },
      });

      this.logger.log(TYPES_NOTICES.DELETE);
      return remover;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - remove');
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
}
