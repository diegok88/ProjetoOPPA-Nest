import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateDispensaDto } from './dto/create-dispensa.dto';
import { UpdateDispensaDto } from './dto/update-dispensa.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { Dispensa } from './entities/dispensa.entity';
import { TYPES_NOTICES } from '@/utils/types-notices.cosnt';

import { Acao, Prisma } from '@/generated/prisma/client';
import { QueryDispensaFilterDto } from './dto/query-dispensas.dto';

@Injectable()
export class DispensasService {
  private logger = new Logger(DispensasService.name);

  constructor(private prisma: PrismaService) {}

  async create(createDispensaDto: CreateDispensaDto): Promise<Dispensa> {
    try {
      const criar = await this.prisma.client.dispensa.create({
        data: { ...createDispensaDto },
      });
      this.logger.log(TYPES_NOTICES.CREATE);
      return criar;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - CREATE');
      throw error;
    }
  }

  async findAll(query: QueryDispensaFilterDto): Promise<Dispensa[]> {
    try {
      const condicao: Prisma.DispensaWhereInput = {};
      if (query.usuarioId) condicao.usuarioId = query.usuarioId;
      if (query.gestorId) condicao.gestorId = query.gestorId;
      if (query.tipoDispensa) condicao.tipoDispensa = query.tipoDispensa;
      if (query.dataInicial || query.dataFinal) {
        condicao.dataInicial = {
          ...(query.dataInicial && { gte: query.dataInicial }),
          ...(query.dataFinal && { lte: query.dataFinal }),
        };
      }
      if (query.status !== undefined) condicao.status = query.status;

      const listar = await this.prisma.client.dispensa.findMany({
        where: condicao,
      });

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

  async update(
    id: string,
    updateDispensaDto: UpdateDispensaDto,
  ): Promise<Dispensa> {
    try {
      const atualizarDispensa = await this.prisma.client.$transaction(
        async (tx: any) => {
          await this.findOne(id, tx);

          const atualizar = await tx.dispensa.update({
            where: { id: id },
            data: updateDispensaDto,
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
}
