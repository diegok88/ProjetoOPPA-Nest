import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Gestor } from './entities/gestor.entity';
import { PrismaService } from '@/prisma/prisma.service';
import { TYPES_NOTICES } from '@/utils/types-notices.cosnt';
import { Auth } from '@/auth/entities/auth.entity';
import { CreateAuditoriaDto } from '../auditoria/dto/create-auditoria.dto';
import { Acao } from '@/generated/prisma/enums';
import { ExtractDataAuditoria } from '@/utils/extract-data-auditoria.util';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { Prisma } from '@/generated/prisma/client';
import { QueryGestorFilterDto } from './dto/query-gestor.dto';
import { UpdateAuditoriaDto } from '../auditoria/dto/update-auditoria.dto';

@Injectable()
export class GestorService {
  private logger = new Logger(GestorService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditoria: AuditoriaService,
  ) {}

  /* 
    CRIAR GESTOR:
    - função interna.
    - somente autorizado para gestores de equipe
  */
  async create(
    id: string,
    autenticado: Auth,
    tx?: Prisma.TransactionClient,
  ): Promise<Gestor> {
    try {
      const executar = async (
        client: Prisma.TransactionClient | PrismaService,
      ) => {
        const criar = await client.gestor.create({
          data: {
            colaboradorId: id,
            gestorId: autenticado.userId,
          },
        });

        const dados = ExtractDataAuditoria(criar);

        const dadosAuditoria: CreateAuditoriaDto = {
          entidade: 'GESTOR',
          registroId: criar.id,
          acao: Acao.CREATE,
          dadosRegistrados: dados,
          empresaId: autenticado.empresa,
          registradoPorId: autenticado.userId,
        };

        await this.auditoria.create(dadosAuditoria, client);

        return criar;
      };

      let criarGestor: any;
      if (tx) {
        criarGestor = await executar(tx);
      } else {
        criarGestor = await this.prisma.$transaction(async (novatx) => {
          return executar(novatx);
        });
      }

      this.logger.log(TYPES_NOTICES.CREATE);
      return criarGestor;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - create');
      throw error;
    }
  }

  /* 
    LISTAR GESTORES: 
    - lista todos os registro de colaboradores e seus gestores.
    - possui um filtro se necessario
  */
  async findAll(query: QueryGestorFilterDto): Promise<Gestor[]> {
    try {
      const condicao: Prisma.GestorWhereInput = {};
      if (query.colaboradorId) condicao.colaboradorId = query.colaboradorId;
      if (query.gestorId) condicao.gestorId = query.gestorId;
      if (query.status) condicao.status = query.status;

      const listar = await this.prisma.gestor.findMany({
        where: condicao,
      });

      if (listar.length === 0) {
        this.logger.warn(TYPES_NOTICES.EMPTY_LIST);
      }

      this.logger.log(TYPES_NOTICES.FIND_ALL);
      return listar;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - findall');
      throw error;
    }
  }

  /* 
    BUSCAR GESTOR POR ID:
    - busca o registro do gestor atraves do id.
  */
  async findOne(id: string, tx?: Prisma.TransactionClient): Promise<Gestor> {
    try {
      const client = tx ?? this.prisma;

      const buscar = await client.gestor.findUnique({
        where: { id: id },
      });

      if (!buscar) {
        this.logger.warn(TYPES_NOTICES.NOT_FOUND);
        throw new NotFoundException(TYPES_NOTICES.NOT_FOUND);
      }

      this.logger.log(TYPES_NOTICES.FIND_ONE);
      return buscar;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.FIND_ONE, ' - findone');
      throw error;
    }
  }
  /* 
    BUSCA ID: 
    - função que busca o id do registro atraves de parametros.
    - função interna
  */
  async findId(
    colaboradorId: string,
    gestorId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<Gestor> {
    try {
      const client = tx ?? this.prisma;

      const buscar = await client.gestor.findFirst({
        where: { colaboradorId: colaboradorId, gestorId: gestorId },
      });

      if (!buscar) {
        this.logger.warn(TYPES_NOTICES.NOT_FOUND);
        throw new NotFoundException(TYPES_NOTICES.NOT_FOUND);
      }

      this.logger.log(TYPES_NOTICES.FIND_ONE);
      return buscar;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - findid');
      throw error;
    }
  }
  /* 
    INATIVAR GESTOR PELO ID: 
    - função interna.
    - inativa o gestor em conjunto com a inativação do usuario.
  */
  async deactive(
    id: string,
    autenticado: Auth,
    tx?: Prisma.TransactionClient,
  ): Promise<Gestor> {
    try {
      const executar = async (
        client: Prisma.TransactionClient | PrismaService,
      ) => {
        const buscar = await this.findId(id, autenticado.userId, client);

        const antes = ExtractDataAuditoria(buscar);

        const inativar = await client.gestor.update({
          where: { id: buscar.id },
          data: {
            status: false,
          },
        });

        const depois = ExtractDataAuditoria(inativar);

        const dadosAuditoria: UpdateAuditoriaDto = {
          entidade: 'GESTOR',
          registroId: inativar.id,
          acao: Acao.DEACTIVATE,
          antes: antes,
          depois: depois,
          empresaId: autenticado.empresa,
          registradoPorId: autenticado.userId,
        };

        await this.auditoria.update(dadosAuditoria);

        return inativar;
      };

      let inativarGestor: any;
      if (tx) {
        inativarGestor = await executar(tx);
      } else {
        inativarGestor = await this.prisma.$transaction(async (novaTx) => {
          return executar(novaTx);
        });
      }

      this.logger.log(TYPES_NOTICES.DEACTIVE);
      return inativarGestor;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - deactive');
      throw error;
    }
  }
  /* 
    REMOVER GESTOR PELO ID:
    - função interna.
    - usada em conjunto com a função de remoção de usuario.
  */
  async remove(
    id: string,
    autenticado: Auth,
    tx?: Prisma.TransactionClient,
  ): Promise<Gestor> {
    try {
      const executar = async (
        client: Prisma.TransactionClient | PrismaService,
      ) => {
        const buscar = await this.findId(id, autenticado.userId, client);

        if (!buscar) {
          this.logger.warn(TYPES_NOTICES.NOT_FOUND);
          throw new NotFoundException(TYPES_NOTICES.NOT_FOUND);
        }

        if (buscar.status === true) {
          this.logger.warn(TYPES_NOTICES.NOT_DEACTIVE);
          throw new BadRequestException(TYPES_NOTICES.NOT_DEACTIVE);
        }

        const remover = await client.gestor.delete({
          where: { id: buscar.id },
        });

        return remover;
      };

      let removerGestor: any;
      if (tx) {
        removerGestor = await executar(tx);
      } else {
        removerGestor = await this.prisma.$transaction(async (novaTx) => {
          return executar(novaTx);
        });
      }

      this.logger.log(TYPES_NOTICES.DELETE);
      return removerGestor;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - remove');
      throw error;
    }
  }
}
