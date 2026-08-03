import { TenantContextService } from '@/auth/tenant-context/tenant-context.service';
import { Prisma, Usuario } from '@/generated/prisma/client';
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
import { Gestor } from './entities/gestor.entity';

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
    LISTAR GESTORES: 
    - lista todos os registro de colaboradores e seus gestores.
    - possui um filtro se necessario
  */
  async findAll(query: QueryGestorFilterDto): Promise<Gestor[]> {
    try {
      const condicao: Prisma.GestorWhereInput = {};
      if (query.colaboradorId) condicao.colaboradorId = query.colaboradorId;
      if (query.gestorId) condicao.gestorId = query.gestorId;
      if (query.status) condicao.status = query.status;

      const listar = await this.prisma.gestor.findMany({
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
  /* 
    BUSCA ID: 
    - função que busca o id do registro atraves de parametros.
    - função interna
  */
  async findId(
    colId: string,
    gesId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<Gestor> {
    try {
      const client = tx ?? this.prisma.client;

      const buscar = await client.gestor.findFirst({
        where: {
          colaboradorId: colId,
          gestorId: gesId,
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
    INATIVAR GESTORES:
    - inativa todos os gestores de acordo com a empresa que os mesmos pertencem.
  */
  async deactiveAll(
    ids: Array<string>,
    tx?: Prisma.TransactionClient,
  ): Promise<Prisma.BatchPayload> {
    try {
      const client = tx ?? this.prisma.client;

      if (ids.length === 0) {
        this.logger.warn(TYPES_NOTICES.EMPTY_LIST);
        throw new BadRequestException(TYPES_NOTICES.EMPTY_LIST);
      }

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
  async remove(id: string, tx?: Prisma.TransactionClient): Promise<Gestor> {
    try {
      const autenticado = this.getCurrentUser();
      const client = tx ?? this.prisma.client;
      const buscar = await this.findId(id, autenticado.user, client);

      if (buscar.status === true) {
        this.logger.warn(TYPES_NOTICES.NOT_DEACTIVE);
        throw new BadRequestException(TYPES_NOTICES.NOT_DEACTIVE);
      }

      if (buscar.gestorId !== autenticado.user) {
        this.logger.warn(TYPES_NOTICES.UNAUTHORIZED);
        throw new UnauthorizedException(TYPES_NOTICES.UNAUTHORIZED);
      }

      const remover = await client.gestor.deleteMany({
        where: { colaboradorId: buscar.colaboradorId },
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
    usuarios: Array<Usuario>,
    tx?: Prisma.TransactionClient,
  ): Promise<Prisma.BatchPayload> {
    try {
      const client = tx ?? this.prisma.client;

      const ativos = usuarios.map((u) => u.status === true);
      if (ativos) {
        this.logger.warn(TYPES_NOTICES.NOT_DEACTIVE);
        throw new BadRequestException(TYPES_NOTICES.NOT_DEACTIVE);
      }

      const ids = usuarios.map((u) => u.id);

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
