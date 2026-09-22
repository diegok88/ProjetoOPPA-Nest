import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateSolucoesDto } from './dto/create-solucoes.dto';
import { UpdateSolucoeDto } from './dto/update-solucoes.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { Solucoes } from './entities/solucoes.entity';
import { TYPES_NOTICES } from '@/utils/types-notices.cosnt';
import { QuerySolucoesFilterDto } from './dto/query-solucoes.dto';
import { Acao, Prisma } from '@/generated/prisma/client';

@Injectable()
export class SolucoesService {
  private logger = new Logger(SolucoesService.name);

  constructor(private prisma: PrismaService) {}

  async create(createSolucoesDto: CreateSolucoesDto): Promise<Solucoes> {
    try {
      const criar = await this.prisma.client.solucoes.create({
        data: { ...createSolucoesDto },
      });
      this.logger.log(TYPES_NOTICES.CREATE);
      return criar;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - CREATE');
      throw error;
    }
  }

  async findAll(query: QuerySolucoesFilterDto): Promise<Solucoes[]> {
    try {
      const condicao: Prisma.SolucoesWhereInput = {};
      if (query.falhaId) condicao.falhaId = query.falhaId;
      if (query.direcionamentoId) {
        condicao.direcionamentoId = query.direcionamentoId;
      }
      if (query.descricao) condicao.descricao = query.descricao;
      if (query.status !== undefined) condicao.status = query.status;

      const listar = await this.prisma.client.solucoes.findMany({
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

  async findOne(id: string, tx?: Prisma.TransactionClient): Promise<Solucoes> {
    try {
      const client = tx ?? this.prisma.client;
      const buscar = await client.solucoes.findUnique({
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

  async update(id: string, updateSolucoeDto: UpdateSolucoeDto): Promise<Solucoes> {
    try {
      const atualizarSolucao = await this.prisma.client.$transaction(
        async (tx: any) => {
          await this.findOne(id, tx);

          const atualizar = await tx.solucoes.update({
            where: { id: id },
            data: updateSolucoeDto,
          });

          return atualizar;
        },
      );

      this.logger.log(TYPES_NOTICES.UPDATE);
      return atualizarSolucao;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - UPDATE');
      throw error;
    }
  }

  async deactive(id: string): Promise<Solucoes> {
    try {
      const inativarSolucao = await this.prisma.client.$transaction(
        async (tx: any) => {
          const verificar = await this.findOne(id, tx);

          if (!verificar.status) {
            this.logger.warn(TYPES_NOTICES.IS_DEACTIVE);
            throw new UnauthorizedException(TYPES_NOTICES.IS_DEACTIVE);
          }

          const inativar = await tx.solucoes.update({
            where: { id: id },
            data: { status: false, _auditAction: Acao.DEACTIVATE },
          });

          return inativar;
        },
      );

      this.logger.log(TYPES_NOTICES.DEACTIVE);
      return inativarSolucao;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - DEACTIVE');
      throw error;
    }
  }

  async remove(id: string): Promise<Solucoes> {
    try {
      const removerSolucao = await this.prisma.client.$transaction(
        async (tx: any) => {
          const verificar = await this.findOne(id, tx);

          if (verificar.status) {
            this.logger.warn(TYPES_NOTICES.UNAUTHORIZED);
            throw new UnauthorizedException(TYPES_NOTICES.UNAUTHORIZED);
          }

          const remover = await tx.solucoes.delete({
            where: { id: id },
          });

          return remover;
        },
      );

      this.logger.log(TYPES_NOTICES.DELETE);
      return removerSolucao;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - REMOVE');
      throw error;
    }
  }
}