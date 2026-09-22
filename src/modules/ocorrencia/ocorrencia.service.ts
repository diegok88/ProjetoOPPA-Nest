import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateOcorrenciaDto } from './dto/create-ocorrencia.dto';
import { UpdateOcorrenciaDto } from './dto/update-ocorrencia.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { Ocorrencia } from './entities/ocorrencia.entity';
import { TYPES_NOTICES } from '@/utils/types-notices.cosnt';
import { Acao, Prisma } from '@/generated/prisma/client';
import { QueryOcorrenciaFilterDto } from './dto/query-ocorrencia.dto';

@Injectable()
export class OcorrenciaService {
  private logger = new Logger(OcorrenciaService.name);

  constructor(private prisma: PrismaService) {}

  async create(createOcorrenciaDto: CreateOcorrenciaDto): Promise<Ocorrencia> {
    try {
      const criar = await this.prisma.client.ocorrencia.create({
        data: { ...createOcorrenciaDto },
      });
      this.logger.log(TYPES_NOTICES.CREATE);
      return criar;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - CREATE');
      throw error;
    }
  }

  async findAll(query: QueryOcorrenciaFilterDto): Promise<Ocorrencia[]> {
    try {
      const condicao: Prisma.OcorrenciaWhereInput = {};
      if (query.estadoAtivoId) condicao.estadoAtivoId = query.estadoAtivoId;
      if (query.falhaId) condicao.falhaId = query.falhaId;
      if (query.solucaoId) condicao.solucaoId = query.solucaoId;
      if (query.solucionadoId) condicao.solucionadoId = query.solucionadoId;
      if (query.dataInicial) condicao.dataInicial = query.dataInicial;
      if (query.status !== undefined) condicao.status = query.status;

      const listar = await this.prisma.client.ocorrencia.findMany({
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
  ): Promise<Ocorrencia> {
    try {
      const client = tx ?? this.prisma.client;
      const buscar = await client.ocorrencia.findUnique({
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
    updateOcorrenciaDto: UpdateOcorrenciaDto,
  ): Promise<Ocorrencia> {
    try {
      const atualizarOcorrencia = await this.prisma.client.$transaction(
        async (tx: any) => {
          await this.findOne(id, tx);

          const atualizar = await tx.ocorrencia.update({
            where: { id: id },
            data: updateOcorrenciaDto,
          });

          return atualizar;
        },
      );

      this.logger.log(TYPES_NOTICES.UPDATE);
      return atualizarOcorrencia;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - UPDATE');
      throw error;
    }
  }

  async deactive(id: string): Promise<Ocorrencia> {
    try {
      const inativarOcorrencia = await this.prisma.client.$transaction(
        async (tx: any) => {
          const verificar = await this.findOne(id, tx);

          if (!verificar.status) {
            this.logger.warn(TYPES_NOTICES.IS_DEACTIVE);
            throw new UnauthorizedException(TYPES_NOTICES.IS_DEACTIVE);
          }

          const inativar = await tx.ocorrencia.update({
            where: { id: id },
            data: { status: false, _auditAction: Acao.DEACTIVATE },
          });

          return inativar;
        },
      );

      this.logger.log(TYPES_NOTICES.DEACTIVE);
      return inativarOcorrencia;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - DEACTIVE');
      throw error;
    }
  }

  async remove(id: string): Promise<Ocorrencia> {
    try {
      const removerOcorrencia = await this.prisma.client.$transaction(
        async (tx: any) => {
          const verificar = await this.findOne(id, tx);

          if (verificar.status) {
            this.logger.warn(TYPES_NOTICES.UNAUTHORIZED);
            throw new UnauthorizedException(TYPES_NOTICES.UNAUTHORIZED);
          }

          const remover = await tx.ocorrencia.delete({
            where: { id: id },
          });

          return remover;
        },
      );

      this.logger.log(TYPES_NOTICES.DELETE);
      return removerOcorrencia;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - REMOVE');
      throw error;
    }
  }
}
