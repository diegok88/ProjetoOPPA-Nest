import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreatePenalidadeDto } from './dto/create-penalidade.dto';
import { UpdatePenalidadeDto } from './dto/update-penalidade.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { Penalidade } from './entities/penalidade.entity';
import { TYPES_NOTICES } from '@/utils/types-notices.cosnt';
import { Acao, Prisma } from '@/generated/prisma/client';
import { QueryPenalidadeFilterDto } from './dto/query-penalidades.dto';

@Injectable()
export class PenalidadesService {
  private logger = new Logger(PenalidadesService.name);

  constructor(private prisma: PrismaService) {}

  async create(createPenalidadeDto: CreatePenalidadeDto): Promise<Penalidade> {
    try {
      const criar = await this.prisma.client.penalidade.create({
        data: { ...createPenalidadeDto },
      });
      this.logger.log(TYPES_NOTICES.CREATE);
      return criar;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - CREATE');
      throw error;
    }
  }

  async findAll(query: QueryPenalidadeFilterDto): Promise<Penalidade[]> {
    try {
      const condicao: Prisma.PenalidadeWhereInput = {};
      if (query.usuarioId) condicao.usuarioId = query.usuarioId;
      if (query.gestorId) condicao.gestorId = query.gestorId;
      if (query.tipoPenalidade) condicao.tipoPenalidade = query.tipoPenalidade;
      if (query.dataInicial || query.dataFinal) {
        condicao.dataInicial = {
          ...(query.dataInicial && { gte: query.dataInicial }),
          ...(query.dataFinal && { lte: query.dataFinal }),
        };
      }
      if (query.status !== undefined) condicao.status = query.status;

      const listar = await this.prisma.client.penalidade.findMany({
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

  async findOne(id: string, tx?: Prisma.TransactionClient): Promise<Penalidade> {
    try {
      const client = tx ?? this.prisma.client;
      const buscar = await client.penalidade.findUnique({
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

  async update(id: string, updatePenalidadeDto: UpdatePenalidadeDto): Promise<Penalidade> {
    try {
      const atualizarPenalidade = await this.prisma.client.$transaction(
        async (tx: any) => {
          await this.findOne(id, tx);

          const atualizar = await tx.penalidade.update({
            where: { id: id },
            data: updatePenalidadeDto,
          });

          return atualizar;
        },
      );

      this.logger.log(TYPES_NOTICES.UPDATE);
      return atualizarPenalidade;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - UPDATE');
      throw error;
    }
  }

  async deactive(id: string): Promise<Penalidade> {
    try {
      const inativarPenalidade = await this.prisma.client.$transaction(
        async (tx: any) => {
          const verificar = await this.findOne(id, tx);

          if (!verificar.status) {
            this.logger.warn(TYPES_NOTICES.IS_DEACTIVE);
            throw new UnauthorizedException(TYPES_NOTICES.IS_DEACTIVE);
          }

          const inativar = await tx.penalidade.update({
            where: { id: id },
            data: { status: false, _auditAction: Acao.DEACTIVATE },
          });

          return inativar;
        },
      );

      this.logger.log(TYPES_NOTICES.DEACTIVE);
      return inativarPenalidade;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - DEACTIVE');
      throw error;
    }
  }

  async remove(id: string): Promise<Penalidade> {
    try {
      const removerPenalidade = await this.prisma.client.$transaction(
        async (tx: any) => {
          const verificar = await this.findOne(id, tx);

          if (verificar.status) {
            this.logger.warn(TYPES_NOTICES.UNAUTHORIZED);
            throw new UnauthorizedException(TYPES_NOTICES.UNAUTHORIZED);
          }

          const remover = await tx.penalidade.delete({
            where: { id: id },
          });

          return remover;
        },
      );

      this.logger.log(TYPES_NOTICES.DELETE);
      return removerPenalidade;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - REMOVE');
      throw error;
    }
  }
}