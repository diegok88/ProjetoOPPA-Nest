import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateCompetenciaSetorialDto } from './dto/create-competencia-setorial.dto';
import { UpdateCompetenciaSetorialDto } from './dto/update-competencia-setorial.dto';
import { TenantContextService } from '@/auth/tenant-context/tenant-context.service';
import { PrismaService } from '@/prisma/prisma.service';
import { CompetenciaSetorial } from './entities/competencia-setorial.entity';
import { TYPES_NOTICES } from '@/utils/types-notices.cosnt';
import { GestorService } from '../gestor/gestor.service';
import { Acao, Prisma } from '@/generated/prisma/client';
import { Query } from 'pg';
import { QueryGestorFilterDto } from '../gestor/dto/query-gestor.dto';

@Injectable()
export class CompetenciaSetorialService {
  private logger = new Logger(CompetenciaSetorialService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly gestorService: GestorService,
    private readonly tenantContext: TenantContextService,
  ) {}

  /*
    CRIAR COMPETÊNCIA SETORIAL:
    - create padrão para todos os registros do sistema.
  */
  async create(
    create: CreateCompetenciaSetorialDto,
  ): Promise<CompetenciaSetorial> {
    try {
      const criar = await this.prisma.client.$transaction(async (tx: any) => {
        const usuario = this.tenantContext.getStore()!;

        /* busca o ultimo registro de competencia */
        const ultimo = await this.findLast(
          create.setorId,
          create.turno,
          true,
          tx,
        );
        /* inativa o registro de competencia */
        await this.deactive(ultimo.id, tx);

        /* query de consulta da lista de gestor */
        const query: QueryGestorFilterDto = {
          gestorId: ultimo.colaboradorId,
          status: true,
        };

        /* busca a lista do gestor atual */
        const listaGestor = await this.gestorService.findAll(query, tx);

        /* lista somente dos ids do gestor atual */
        const ids = listaGestor.map((lista) => lista.id);

        if (ids.length > 0) {
          /* inativa todos os colaboradores do gestor atual */
          await this.gestorService.deactiveAll(ids, tx);

          /* cria novo registro de gestor para os colaboradores cadastrador com gestor anterior */
          await this.gestorService.createAll(ids, create.usuarioId, tx);
        }

        /* verifica se o gestor alocado pertence a gestão do alocador */
        const gestor = await this.gestorService.findId(
          create.usuarioId,
          usuario.user,
          tx,
        );

        if (create.turno !== gestor.colaborador.turno) {
          this.logger.warn(TYPES_NOTICES.NOT_SHIFT);
          throw new UnauthorizedException(TYPES_NOTICES.NOT_SHIFT);
        }
        /* cria a nova competência */
        const criar = await tx.competenciaSetorial.create({
          data: create,
        });

        return criar;
      });
      this.logger.log(TYPES_NOTICES.CREATE);
      return criar;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - CREATE');
      throw error;
    }
  }

  findAll() {
    return `This action returns all competenciaSetorial`;
  }

  findOne(id: number) {
    return `This action returns a #${id} competenciaSetorial`;
  }

  async findLast(
    setorId: string,
    turno: string,
    status: boolean,
    tx?: Prisma.TransactionClient,
  ): Promise<CompetenciaSetorial> {
    try {
      const client = tx ?? this.prisma.client;

      const buscar = await client.competenciaSetorial.findFirst({
        where: { setorId: setorId, turno: turno, status: status },
      });

      if (!buscar) {
        this.logger.warn(TYPES_NOTICES.NOT_FOUND);
        throw new NotFoundException(TYPES_NOTICES.NOT_FOUND);
      }

      return buscar;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - FINDLAST');
      throw error;
    }
  }

  update(
    id: number,
    updateCompetenciaSetorialDto: UpdateCompetenciaSetorialDto,
  ) {
    return `This action updates a #${id} competenciaSetorial`;
  }

  async deactive(
    id: string,
    tx?: Prisma.TransactionClient,
  ): Promise<CompetenciaSetorial> {
    try {
      const client = tx ?? this.prisma.client;

      const inativar = await client.competenciaSetorial.update({
        where: { id: id },
        data: {
          status: false,
          _auditAction: Acao.DEACTIVATE,
        },
      });

      this.logger.log(TYPES_NOTICES.DEACTIVE);
      return inativar;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - DEACTIVE');
      throw error;
    }
  }

  remove(id: number) {
    return `This action removes a #${id} competenciaSetorial`;
  }
}
