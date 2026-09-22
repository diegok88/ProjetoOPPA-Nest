import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateTipoSolicitacaoDto } from './dto/create-tipo-solicitacao.dto';
import { UpdateTipoSolicitacaoDto } from './dto/update-tipo-solicitacao.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { TipoSolicitacao } from './entities/tipo-solicitacao.entity';
import { TYPES_NOTICES } from '@/utils/types-notices.cosnt';
import { Acao, Prisma } from '@/generated/prisma/client';
import { QueryTipoSolicitacaoFilterDto } from './dto/query-tipo-solicitacao.dto';

@Injectable()
export class TipoSolicitacaoService {
  private logger = new Logger(TipoSolicitacaoService.name);

  constructor(private prisma: PrismaService) {}

  async create(
    createTipoSolicitacaoDto: CreateTipoSolicitacaoDto,
  ): Promise<TipoSolicitacao> {
    try {
      const criar = await this.prisma.client.tipoSolicitacao.create({
        data: { ...createTipoSolicitacaoDto },
      });
      this.logger.log(TYPES_NOTICES.CREATE);
      return criar;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - CREATE');
      throw error;
    }
  }

  async findAll(
    query: QueryTipoSolicitacaoFilterDto,
  ): Promise<TipoSolicitacao[]> {
    try {
      const condicao: Prisma.TipoSolicitacaoWhereInput = {};
      if (query.descricao) condicao.descricao = query.descricao;
      if (query.status !== undefined) condicao.status = query.status;

      const listar = await this.prisma.client.tipoSolicitacao.findMany({
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
  ): Promise<TipoSolicitacao> {
    try {
      const client = tx ?? this.prisma.client;
      const buscar = await client.tipoSolicitacao.findUnique({
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
    updateTipoSolicitacaoDto: UpdateTipoSolicitacaoDto,
  ): Promise<TipoSolicitacao> {
    try {
      const atualizarTipo = await this.prisma.client.$transaction(
        async (tx: any) => {
          await this.findOne(id, tx);

          const atualizar = await tx.tipoSolicitacao.update({
            where: { id: id },
            data: updateTipoSolicitacaoDto,
          });

          return atualizar;
        },
      );

      this.logger.log(TYPES_NOTICES.UPDATE);
      return atualizarTipo;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - UPDATE');
      throw error;
    }
  }

  async deactive(id: string): Promise<TipoSolicitacao> {
    try {
      const inativarTipo = await this.prisma.client.$transaction(
        async (tx: any) => {
          const verificar = await this.findOne(id, tx);

          if (!verificar.status) {
            this.logger.warn(TYPES_NOTICES.IS_DEACTIVE);
            throw new UnauthorizedException(TYPES_NOTICES.IS_DEACTIVE);
          }

          const inativar = await tx.tipoSolicitacao.update({
            where: { id: id },
            data: { status: false, _auditAction: Acao.DEACTIVATE },
          });

          return inativar;
        },
      );

      this.logger.log(TYPES_NOTICES.DEACTIVE);
      return inativarTipo;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - DEACTIVE');
      throw error;
    }
  }

  async remove(id: string): Promise<TipoSolicitacao> {
    try {
      const removerTipo = await this.prisma.client.$transaction(
        async (tx: any) => {
          const verificar = await this.findOne(id, tx);

          if (verificar.status) {
            this.logger.warn(TYPES_NOTICES.UNAUTHORIZED);
            throw new UnauthorizedException(TYPES_NOTICES.UNAUTHORIZED);
          }

          const remover = await tx.tipoSolicitacao.delete({
            where: { id: id },
          });

          return remover;
        },
      );

      this.logger.log(TYPES_NOTICES.DELETE);
      return removerTipo;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - REMOVE');
      throw error;
    }
  }
}
