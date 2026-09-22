import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateControleJornadaDto } from './dto/create-controle-jornada.dto';
import { UpdateControleJornadaDto } from './dto/update-controle-jornada.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { ControleJornada } from './entities/controle-jornada.entity';
import { TYPES_NOTICES } from '@/utils/types-notices.cosnt';
import { QueryControleJornadaFilterDto } from './dto/query-controle-jornada.dto';
import { Acao, Prisma } from '@/generated/prisma/client';

@Injectable()
export class ControleJornadaService {
  private logger = new Logger(ControleJornadaService.name);

  constructor(private prisma: PrismaService) {}

  async create(
    createControleJornadaDto: CreateControleJornadaDto,
  ): Promise<ControleJornada> {
    try {
      const criar = await this.prisma.client.controleJornada.create({
        data: { ...createControleJornadaDto },
      });
      this.logger.log(TYPES_NOTICES.CREATE);
      return criar;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - CREATE');
      throw error;
    }
  }

  async findAll(
    query: QueryControleJornadaFilterDto,
  ): Promise<ControleJornada[]> {
    try {
      const condicao: Prisma.ControleJornadaWhereInput = {};
      if (query.usuarioId) condicao.usuarioId = query.usuarioId;
      if (query.tipoJornada) condicao.tipoJornada = query.tipoJornada;
      if (query.estadoJornada) condicao.estadoJornada = query.estadoJornada;
      if (query.tagAtivoId) condicao.tagAtivoId = query.tagAtivoId;
      if (query.status !== undefined) condicao.status = query.status;

      const listar = await this.prisma.client.controleJornada.findMany({
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

  async findOne(
    id: string,
    tx?: Prisma.TransactionClient,
  ): Promise<ControleJornada> {
    try {
      const client = tx ?? this.prisma.client;
      const buscar = await client.controleJornada.findUnique({
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
    updateControleJornadaDto: UpdateControleJornadaDto,
  ): Promise<ControleJornada> {
    try {
      const atualizarJornada = await this.prisma.client.$transaction(
        async (tx: any) => {
          await this.findOne(id, tx);

          const atualizar = await tx.controleJornada.update({
            where: { id: id },
            data: updateControleJornadaDto,
          });

          return atualizar;
        },
      );

      this.logger.log(TYPES_NOTICES.UPDATE);
      return atualizarJornada;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - UPDATE');
      throw error;
    }
  }

  async deactive(id: string): Promise<ControleJornada> {
    try {
      const inativarJornada = await this.prisma.client.$transaction(
        async (tx: any) => {
          const verificar = await this.findOne(id, tx);

          if (!verificar.status) {
            this.logger.warn(TYPES_NOTICES.IS_DEACTIVE);
            throw new UnauthorizedException(TYPES_NOTICES.IS_DEACTIVE);
          }

          const inativar = await tx.controleJornada.update({
            where: { id: id },
            data: { status: false, _auditAction: Acao.DEACTIVATE },
          });

          return inativar;
        },
      );

      this.logger.log(TYPES_NOTICES.DEACTIVE);
      return inativarJornada;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - DEACTIVE');
      throw error;
    }
  }

  async remove(id: string): Promise<ControleJornada> {
    try {
      const removerJornada = await this.prisma.client.$transaction(
        async (tx: any) => {
          const verificar = await this.findOne(id, tx);

          if (verificar.status) {
            this.logger.warn(TYPES_NOTICES.UNAUTHORIZED);
            throw new UnauthorizedException(TYPES_NOTICES.UNAUTHORIZED);
          }

          const remover = await tx.controleJornada.delete({
            where: { id: id },
          });

          return remover;
        },
      );

      this.logger.log(TYPES_NOTICES.DELETE);
      return removerJornada;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - REMOVE');
      throw error;
    }
  }
}