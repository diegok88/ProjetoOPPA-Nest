import { UserContext } from '@/auth/tenant-context/user-context.interface';
import { Acao, Prisma } from '@/generated/prisma/client';
import { Gestor } from '@/modules/gestor/entities/gestor.entity';
import { PrismaService } from '@/prisma/prisma.service';
import { TYPES_NOTICES } from '@/utils/types-notices.cosnt';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';

@Injectable()
export class GestorOrquestradorService {
  private logger = new Logger(GestorOrquestradorService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(
    colaboradorid: string,
    gestorId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<Gestor> {
    try {
      const client = tx ?? this.prisma.client;

      const criar = await client.gestor.create({
        data: {
          colaboradorId: colaboradorid,
          gestorId: gestorId,
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
    INATIVAR GESTOR PELO ID: 
    - função interna.
    - inativa o gestor em conjunto com a inativação do usuario.
  */
  async active(
    colaboradorId: string,
    ctx: UserContext,
    tx?: Prisma.TransactionClient,
  ): Promise<Gestor> {
    try {
      const client = tx ?? this.prisma.client;

      const listar = await client.gestor.findMany({
        where: {
          colaboradorId: colaboradorId,
          gestorId: ctx.user,
          status: true,
        },
      });

      if (listar > 0) {
        const ids = listar.map((g) => g.id);
        await client.gestor.updateMany({
          where: { id: { in: ids } },
          data: { status: false },
        });
        this.logger.warn(`Número total de gestores atualizados: ${ids}`);
      }

      const ativar = await client.gestor.create({
        data: { colaboradorId: colaboradorId, gestorId: ctx.user },
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
  async deactive(
    colaboradorId: string,
    ctx: UserContext,
    tx?: Prisma.TransactionClient,
  ): Promise<Gestor> {
    try {
      const client = tx ?? this.prisma.client;

      const listar = await client.gestor.findMany({
        where: {
          colaboradorId: colaboradorId,
          gestorId: ctx.user,
          status: true,
        },
      });

      const ids = listar.map((g) => g.id);

      if (ids.length === 0) {
        this.logger.warn(TYPES_NOTICES.IS_DEACTIVE);
        throw new BadRequestException(TYPES_NOTICES.IS_DEACTIVE);
      }

      const inativar = await client.gestor.updateMany({
        where: { id: { in: ids } },
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
}
