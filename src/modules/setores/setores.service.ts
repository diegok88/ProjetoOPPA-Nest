import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateSetoresDto } from './dto/create-setores.dto';
import { UpdateSetoresDto } from './dto/update-setores.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { Setores } from './entities/setores.entity';
import { TYPES_NOTICES } from '@/utils/types-notices.cosnt';
import { Acao, Prisma } from '@/generated/prisma/client';
import { QuerySetoresDto } from './dto/query-setores.dto';
import { TenantContextService } from '@/auth/tenant-context/tenant-context.service';
import { Contador } from '@/interfaces/counter.interface';

@Injectable()
export class SetoresService {
  private logger = new Logger(SetoresService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContextService,
  ) {}

  /*
  CRIAR SETORES:
  - serviço apenas permitido para usuaria ADMINISTRADOR E ASSISTENCIA - NIVEL 1
  */
  async create(createSetoresDto: CreateSetoresDto): Promise<Setores> {
    const empresa = this.tenantContext.getStore();
    try {
      const criar = await this.prisma.client.setores.create({
        data: {
          descricao: createSetoresDto.descricao,
          empresaId: empresa?.empresa,
        },
      });

      this.logger.log(TYPES_NOTICES.CREATE);
      return criar;
    } catch (error) {
      this.logger.log(TYPES_NOTICES.SERVICE_FAILURE, ' - CREATE');
      throw error;
    }
  }

  /*
  LISTAR SETORES:
  - serviço apenas permitido para usuaria ADMINISTRADOR E ASSISTENCIA - NIVEL 1
  */
  async findAll(query: QuerySetoresDto): Promise<Setores[]> {
    try {
      const condicao: Prisma.SetoresWhereInput = {};
      if (query.descricao) condicao.descricao = query.descricao;
      if (query.empresaId) condicao.empresaId = query.empresaId;
      if (query.status) condicao.status = query.status;

      const listar = await this.prisma.client.setores.findMany({
        where: condicao,
        orderBy: { descricao: 'asc' },
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

  /* FUNÇÃO CONTADOR DE REGISTROS SENDO O TOTAL, ATIVOS E INATIVOS */
  async counter(): Promise<Contador> {
    try {
      const [total, ativos, inativos] = await Promise.all([
        this.prisma.setores.count(),
        this.prisma.setores.count({ where: { status: true } }),
        this.prisma.setores.count({ where: { status: false } }),
      ]);

      this.logger.log(TYPES_NOTICES.COUNTER);
      return { total, ativos, inativos };
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - COUNTER');
      throw error;
    }
  }

  /*
  BUSCAR SETORES:
  - serviço apenas permitido para usuaria ADMINISTRADOR E ASSISTENCIA - NIVEL 1
  */
  async findOne(id: string, tx?: Prisma.TransactionClient): Promise<Setores> {
    try {
      const client = tx ?? this.prisma.client;
      const buscar = await client.setores.findUnique({
        where: { id: id },
        include: { empresa: true },
      });
      if (!buscar) {
        this.logger.warn(TYPES_NOTICES.NOT_FOUND);
        throw new NotFoundException(TYPES_NOTICES.NOT_FOUND);
      }

      this.logger.log(TYPES_NOTICES.FIND_ONE);
      return buscar;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - FINDONE');
      throw error;
    }
  }

  /*
  ATUALIZAR SETORES:
  - serviço apenas permitido para usuaria ADMINISTRADOR E ASSISTENCIA - NIVEL 1
  */
  async update(
    id: string,
    updateSetoresDto: UpdateSetoresDto,
  ): Promise<Setores> {
    try {
      const atualizarSetores = await this.prisma.client.$transaction(
        async (tx: any) => {
          await this.findOne(id, tx);

          const atualizar = await tx.setores.update({
            where: { id: id },
            data: updateSetoresDto,
          });

          return atualizar;
        },
      );

      this.logger.log(TYPES_NOTICES.UPDATE);
      return atualizarSetores;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - UPDATE');
      throw error;
    }
  }

  /*
  ATIVAR SETORES:
  - serviço apenas permitido para usuaria ADMINISTRADOR E ASSISTENCIA - NIVEL 1
  */
  async active(id: string): Promise<Setores> {
    try {
      const ativarSetores = await this.prisma.client.$transaction(
        async (tx: any) => {
          const verificar = await this.findOne(id, tx);

          if (verificar.status) {
            this.logger.warn(TYPES_NOTICES.IS_ACTIVE);
            throw new UnauthorizedException(TYPES_NOTICES.IS_ACTIVE);
          }

          const ativar = await tx.setores.update({
            where: { id: id },
            data: { status: true, _auditAction: Acao.ACTIVE },
          });

          return ativar;
        },
      );

      this.logger.log(TYPES_NOTICES.ACTIVE);
      return ativarSetores;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - ACTIVE');
      throw error;
    }
  }

  /*
  INATIVAR SETORES:
  - serviço apenas permitido para usuaria ADMINISTRADOR E ASSISTENCIA - NIVEL 1
  */
  async deactive(id: string): Promise<Setores> {
    try {
      const inativarSetores = await this.prisma.client.$transaction(
        async (tx: any) => {
          const verificar = await this.findOne(id, tx);

          if (!verificar.status) {
            this.logger.warn(TYPES_NOTICES.IS_DEACTIVE);
            throw new UnauthorizedException(TYPES_NOTICES.IS_DEACTIVE);
          }

          const inativar = await tx.setores.update({
            where: { id: id },
            data: { status: false, _auditAction: Acao.DEACTIVATE },
          });

          return inativar;
        },
      );

      this.logger.log(TYPES_NOTICES.DEACTIVE);
      return inativarSetores;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - DEACTIVE');
      throw error;
    }
  }

  /*
  REMOVER SETORES:
  - serviço apenas permitido para usuaria ADMINISTRADOR E ASSISTENCIA - NIVEL 1
  */
  async remove(id: string): Promise<Setores> {
    try {
      const deletarSetores = await this.prisma.client.$transaction(
        async (tx: any) => {
          const verificar = await this.findOne(id, tx);

          if (verificar.status) {
            this.logger.warn(TYPES_NOTICES.UNAUTHORIZED);
            throw new UnauthorizedException(TYPES_NOTICES.UNAUTHORIZED);
          }

          const deletar = await tx.setores.delete({
            where: { id: id },
          });

          return deletar;
        },
      );

      this.logger.log(TYPES_NOTICES.DELETE);
      return deletarSetores;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - REMOVE');
      throw error;
    }
  }
}
