import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateFalhaDto } from './dto/create-falha.dto';
import { UpdateFalhaDto } from './dto/update-falha.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { Falha } from './entities/falha.entity';
import { TYPES_NOTICES } from '@/utils/types-notices.cosnt';

import { Acao, Prisma } from '@/generated/prisma/client';
import { QueryFalhasFilterDto } from './dto/query-falhas.dto';

@Injectable()
export class FalhasService {
  private logger = new Logger(FalhasService.name);

  constructor(private prisma: PrismaService) {}

  async create(createFalhaDto: CreateFalhaDto): Promise<Falha> {
    try {
      const criar = await this.prisma.client.falha.create({
        data: { ...createFalhaDto },
      });
      this.logger.log(TYPES_NOTICES.CREATE);
      return criar;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - CREATE');
      throw error;
    }
  }

  async findAll(query: QueryFalhasFilterDto): Promise<Falha[]> {
    try {
      const condicao: Prisma.FalhasWhereInput = {};
      if (query.codigo !== undefined) condicao.codigo = query.codigo;
      if (query.descricao) condicao.descricao = query.descricao;
      if (query.ativoId) condicao.ativoId = query.ativoId;
      if (query.direcionamentoId) {
        condicao.direcionamentoId = query.direcionamentoId;
      }
      if (query.status !== undefined) condicao.status = query.status;

      const listar = await this.prisma.client.falha.findMany({
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

  async findOne(id: string, tx?: Prisma.TransactionClient): Promise<Falha> {
    try {
      const client = tx ?? this.prisma.client;
      const buscar = await client.falha.findUnique({
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

  async update(id: string, updateFalhaDto: UpdateFalhaDto): Promise<Falha> {
    try {
      const atualizarFalha = await this.prisma.client.$transaction(
        async (tx: any) => {
          await this.findOne(id, tx);

          const atualizar = await tx.falha.update({
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

  async deactive(id: string): Promise<Falha> {
    try {
      const inativarFalha = await this.prisma.client.$transaction(
        async (tx: any) => {
          const verificar = await this.findOne(id, tx);

          if (!verificar.status) {
            this.logger.warn(TYPES_NOTICES.IS_DEACTIVE);
            throw new UnauthorizedException(TYPES_NOTICES.IS_DEACTIVE);
          }

          const inativar = await tx.falha.update({
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

  async remove(id: string): Promise<Falha> {
    try {
      const removerFalha = await this.prisma.client.$transaction(
        async (tx: any) => {
          const verificar = await this.findOne(id, tx);

          if (verificar.status) {
            this.logger.warn(TYPES_NOTICES.UNAUTHORIZED);
            throw new UnauthorizedException(TYPES_NOTICES.UNAUTHORIZED);
          }

          const remover = await tx.falha.delete({
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
}
