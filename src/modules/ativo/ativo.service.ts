import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateAtivoDto } from './dto/create-ativo.dto';
import { UpdateAtivoDto } from './dto/update-ativo.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { Ativo } from './entities/ativo.entity';
import { TYPES_NOTICES } from '@/utils/types-notices.cosnt';
import { QueryAtivoFilterDto } from './dto/query-ativo.dto';
import { Acao, Prisma } from '@/generated/prisma/client';

@Injectable()
export class AtivoService {
  private logger = new Logger(AtivoService.name);

  constructor(private prisma: PrismaService) {}

  async create(createAtivoDto: CreateAtivoDto): Promise<Ativo> {
    try {
      const criar = await this.prisma.client.ativo.create({
        data: { ...createAtivoDto },
      });
      this.logger.log(TYPES_NOTICES.CREATE);
      return criar;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - CREATE');
      throw error;
    }
  }

  async findAll(query: QueryAtivoFilterDto): Promise<Ativo[]> {
    try {
      const condicao: Prisma.AtivoWhereInput = {};
      if (query.descricao) condicao.descricao = query.descricao;
      if (query.modelo) condicao.modelo = query.modelo;
      if (query.fabricante) condicao.fabricante = query.fabricante;
      if (query.ano) condicao.ano = query.ano;
      if (query.setorId) condicao.setorId = query.setorId;
      if (query.status) condicao.status = query.status;

      const listar = await this.prisma.client.ativo.findMany({
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

  async findOne(id: string, tx?: Prisma.TransactionClient): Promise<Ativo> {
    try {
      const client = tx ?? this.prisma.client;
      const buscar = await client.ativo.findUnique({
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
}
