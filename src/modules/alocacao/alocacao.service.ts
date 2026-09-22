import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateAlocacaoDto } from './dto/create-alocacao.dto';
import { UpdateAlocacaoDto } from './dto/update-alocacao.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { TenantContextService } from '@/auth/tenant-context/tenant-context.service';
import { Alocacao } from './entities/alocacao.entity';
import { TYPES_NOTICES } from '@/utils/types-notices.cosnt';
import { QueryAlocacaoFilterDto } from './dto/query-alocacao.dto';
import { Acao, Prisma } from '@/generated/prisma/client';

@Injectable()
export class AlocacaoService {
  private logger = new Logger(AlocacaoService.name);

  constructor(
    private prisma: PrismaService,
    private tennant: TenantContextService,
  ) {}

  async create(createAlocacaoDto: CreateAlocacaoDto): Promise<Alocacao> {
    try {
      const gestor = this.tennant.getStore()!.user;
      const criar = await this.prisma.client.alocacaoOperacional.create({
        data: { ...createAlocacaoDto, gestorId: gestor },
      });
      this.logger.log(TYPES_NOTICES.CREATE);
      return criar;
    } catch (error) {
      this.logger.log(TYPES_NOTICES.SERVICE_FAILURE, ' - CREATE');
      throw error;
    }
  }

  async findAll(query: QueryAlocacaoFilterDto): Promise<Alocacao[]> {
    try {
      const condicao: Prisma.AlocacaoOperacionalWhereInput = {};
      if (query.operadorId) condicao.operadorId = query.operadorId;
      if (query.gestorId) condicao.gestorId = query.gestorId;
      if (query.tagAtivoId) condicao.tagAtivoId = query.tagAtivoId;
      if (query.status) condicao.status = query.status;

      const listar = await this.prisma.alocacaoOperacional.findMany({
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

  async findOne(id: string, tx?: Prisma.TransactionClient): Promise<Alocacao> {
    try {
      const client = tx ?? this.prisma.client;
      const buscar = await client.alocacaoOperacional.findUnique({
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
    updateAlocacaoDto: UpdateAlocacaoDto,
  ): Promise<Alocacao> {
    try {
      const atualizarAlocacao = await this.prisma.client.$transaction(
        async (tx: any) => {
          await this.findOne(id, tx);

          const atualizar = await tx.perfil.update({
            where: { id: id },
            data: updateAlocacaoDto,
          });

          return atualizar;
        },
      );

      this.logger.log(TYPES_NOTICES.UPDATE);
      return atualizarAlocacao;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - UPDATE');
      throw error;
    }
  }

  async deactive(id: string): Promise<Alocacao> {
    try {
      const inativarPerfil = await this.prisma.client.$transaction(
        async (tx: any) => {
          const verificar = await this.findOne(id, tx);

          if (!verificar.status) {
            this.logger.warn(TYPES_NOTICES.IS_DEACTIVE);
            throw new UnauthorizedException(TYPES_NOTICES.IS_DEACTIVE);
          }

          const inativar = await tx.alocacaoOperacional.update({
            where: { id: id },
            data: { status: false, _auditAction: Acao.DEACTIVATE },
          });

          return inativar;
        },
      );

      this.logger.log(TYPES_NOTICES.DEACTIVE);
      return inativarPerfil;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - DEACTIVE');
      throw error;
    }
  }

  async remove(id: string): Promise<Alocacao> {
    try {
      const removerAlocacao = await this.prisma.client.$transaction(
        async (tx: any) => {
          const verificar = await this.findOne(id, tx);

          if (verificar.status) {
            this.logger.warn(TYPES_NOTICES.UNAUTHORIZED);
            throw new UnauthorizedException(TYPES_NOTICES.UNAUTHORIZED);
          }

          const remover = await tx.alocacaoOperacional.delete({
            where: { id: id },
          });

          return remover;
        },
      );

      this.logger.log(TYPES_NOTICES.DELETE);
      return removerAlocacao;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - REMOVE');
      throw error;
    }
  }
}
