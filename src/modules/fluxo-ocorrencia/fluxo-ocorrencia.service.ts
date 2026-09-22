import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateFluxoOcorrenciaDto } from './dto/create-fluxo-ocorrencia.dto';
import { UpdateFluxoOcorrenciaDto } from './dto/update-fluxo-ocorrencia.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { FluxoOcorrencia } from './entities/fluxo-ocorrencia.entity';
import { TYPES_NOTICES } from '@/utils/types-notices.cosnt';
import { QueryFluxoOcorrenciaFilterDto } from './dto/query-fluxo-ocorrencia.dto';
import { Acao, Prisma } from '@/generated/prisma/client';

@Injectable()
export class FluxoOcorrenciaService {
  private logger = new Logger(FluxoOcorrenciaService.name);

  constructor(private prisma: PrismaService) {}

  async create(
    createFluxoOcorrenciaDto: CreateFluxoOcorrenciaDto,
  ): Promise<FluxoOcorrencia> {
    try {
      const criar = await this.prisma.client.fluxoOcorrencia.create({
        data: { ...createFluxoOcorrenciaDto },
      });
      this.logger.log(TYPES_NOTICES.CREATE);
      return criar;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - CREATE');
      throw error;
    }
  }

  async findAll(
    query: QueryFluxoOcorrenciaFilterDto,
  ): Promise<FluxoOcorrencia[]> {
    try {
      const condicao: Prisma.FluxoOcorrenciaWhereInput = {};
      if (query.ocorrenciaId) condicao.ocorrenciaId = query.ocorrenciaId;
      if (query.usuarioId) condicao.usuarioId = query.usuarioId;
      if (query.transferidoPerfilId) {
        condicao.transferidoPerfilId = query.transferidoPerfilId;
      }
      if (query.dataInicial) condicao.dataInicial = query.dataInicial;
      if (query.status !== undefined) condicao.status = query.status;

      const listar = await this.prisma.client.fluxoOcorrencia.findMany({
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
  ): Promise<FluxoOcorrencia> {
    try {
      const client = tx ?? this.prisma.client;
      const buscar = await client.fluxoOcorrencia.findUnique({
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
    updateFluxoOcorrenciaDto: UpdateFluxoOcorrenciaDto,
  ): Promise<FluxoOcorrencia> {
    try {
      const atualizarFluxoOcorrencia = await this.prisma.client.$transaction(
        async (tx: any) => {
          await this.findOne(id, tx);

          const atualizar = await tx.fluxoOcorrencia.update({
            where: { id: id },
            data: updateFluxoOcorrenciaDto,
          });

          return atualizar;
        },
      );

      this.logger.log(TYPES_NOTICES.UPDATE);
      return atualizarFluxoOcorrencia;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - UPDATE');
      throw error;
    }
  }

  async deactive(id: string): Promise<FluxoOcorrencia> {
    try {
      const inativarFluxoOcorrencia = await this.prisma.client.$transaction(
        async (tx: any) => {
          const verificar = await this.findOne(id, tx);

          if (!verificar.status) {
            this.logger.warn(TYPES_NOTICES.IS_DEACTIVE);
            throw new UnauthorizedException(TYPES_NOTICES.IS_DEACTIVE);
          }

          const inativar = await tx.fluxoOcorrencia.update({
            where: { id: id },
            data: { status: false, _auditAction: Acao.DEACTIVATE },
          });

          return inativar;
        },
      );

      this.logger.log(TYPES_NOTICES.DEACTIVE);
      return inativarFluxoOcorrencia;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - DEACTIVE');
      throw error;
    }
  }

  async remove(id: string): Promise<FluxoOcorrencia> {
    try {
      const removerFluxoOcorrencia = await this.prisma.client.$transaction(
        async (tx: any) => {
          const verificar = await this.findOne(id, tx);

          if (verificar.status) {
            this.logger.warn(TYPES_NOTICES.UNAUTHORIZED);
            throw new UnauthorizedException(TYPES_NOTICES.UNAUTHORIZED);
          }

          const remover = await tx.fluxoOcorrencia.delete({
            where: { id: id },
          });

          return remover;
        },
      );

      this.logger.log(TYPES_NOTICES.DELETE);
      return removerFluxoOcorrencia;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - REMOVE');
      throw error;
    }
  }
}
