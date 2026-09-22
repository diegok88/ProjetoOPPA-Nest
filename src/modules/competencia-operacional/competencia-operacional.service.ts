import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateCompetenciaOperacionalDto } from './dto/create-competencia-operacional.dto';
import { UpdateCompetenciaOperacionalDto } from './dto/update-competencia-operacional.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { CompetenciaOperacional } from './entities/competencia-operacional.entity';
import { TYPES_NOTICES } from '@/utils/types-notices.cosnt';
import { QueryCompetenciaOperacionalFilterDto } from './dto/query-competencia-operacional.dto';
import { Acao, Prisma } from '@/generated/prisma/client';

@Injectable()
export class CompetenciaOperacionalService {
  private logger = new Logger(CompetenciaOperacionalService.name);

  constructor(private prisma: PrismaService) {}

  async create(
    createCompetenciaOperacionalDto: CreateCompetenciaOperacionalDto,
  ): Promise<CompetenciaOperacional> {
    try {
      const criar = await this.prisma.client.competenciaOperacional.create({
        data: { ...createCompetenciaOperacionalDto },
      });
      this.logger.log(TYPES_NOTICES.CREATE);
      return criar;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - CREATE');
      throw error;
    }
  }

  async findAll(
    query: QueryCompetenciaOperacionalFilterDto,
  ): Promise<CompetenciaOperacional[]> {
    try {
      const condicao: Prisma.CompetenciaOperacionalWhereInput = {};
      if (query.operadorId) condicao.operadorId = query.operadorId;
      if (query.gestorId) condicao.gestorId = query.gestorId;
      if (query.ativoId) condicao.ativoId = query.ativoId;
      if (query.status !== undefined) condicao.status = query.status;

      const listar = await this.prisma.client.competenciaOperacional.findMany({
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
  ): Promise<CompetenciaOperacional> {
    try {
      const client = tx ?? this.prisma.client;
      const buscar = await client.competenciaOperacional.findUnique({
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
    updateCompetenciaOperacionalDto: UpdateCompetenciaOperacionalDto,
  ): Promise<CompetenciaOperacional> {
    try {
      const atualizarCompetencia = await this.prisma.client.$transaction(
        async (tx: any) => {
          await this.findOne(id, tx);

          const atualizar = await tx.competenciaOperacional.update({
            where: { id: id },
            data: updateCompetenciaOperacionalDto,
          });

          return atualizar;
        },
      );

      this.logger.log(TYPES_NOTICES.UPDATE);
      return atualizarCompetencia;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - UPDATE');
      throw error;
    }
  }

  async deactive(id: string): Promise<CompetenciaOperacional> {
    try {
      const inativarCompetencia = await this.prisma.client.$transaction(
        async (tx: any) => {
          const verificar = await this.findOne(id, tx);

          if (!verificar.status) {
            this.logger.warn(TYPES_NOTICES.IS_DEACTIVE);
            throw new UnauthorizedException(TYPES_NOTICES.IS_DEACTIVE);
          }

          const inativar = await tx.competenciaOperacional.update({
            where: { id: id },
            data: { status: false, _auditAction: Acao.DEACTIVATE },
          });

          return inativar;
        },
      );

      this.logger.log(TYPES_NOTICES.DEACTIVE);
      return inativarCompetencia;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - DEACTIVE');
      throw error;
    }
  }

  async remove(id: string): Promise<CompetenciaOperacional> {
    try {
      const removerCompetencia = await this.prisma.client.$transaction(
        async (tx: any) => {
          const verificar = await this.findOne(id, tx);

          if (verificar.status) {
            this.logger.warn(TYPES_NOTICES.UNAUTHORIZED);
            throw new UnauthorizedException(TYPES_NOTICES.UNAUTHORIZED);
          }

          const remover = await tx.competenciaOperacional.delete({
            where: { id: id },
          });

          return remover;
        },
      );

      this.logger.log(TYPES_NOTICES.DELETE);
      return removerCompetencia;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - REMOVE');
      throw error;
    }
  }
}