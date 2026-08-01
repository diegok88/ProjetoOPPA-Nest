import { Auth } from '@/auth/entities/auth.entity';
import { Prisma } from '@/generated/prisma/client';
import { Acao } from '@/generated/prisma/enums';
import { PrismaService } from '@/prisma/prisma.service';
import { ExtractDataAuditoria } from '@/utils/extract-data-auditoria.util';
import { TYPES_NOTICES } from '@/utils/types-notices.cosnt';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { CreateAuditoriaDto } from '../auditoria/dto/create-auditoria.dto';
import { UpdateAuditoriaDto } from '../auditoria/dto/update-auditoria.dto';
import { CreateContadorCrachaDto } from './dto/create-contador-cracha.dto';
import { QueryContadorCrachaFilterDto } from './dto/query-contador-cracha.dto';
import { ResponseContadorEnterpriseDto } from './dto/response-contador-cracha.dto';
import { UpdateContadorCrachaDto } from './dto/update-contador-cracha.dto';
import { ContadorCracha } from './entities/contador-cracha.entity';

@Injectable()
export class ContadorCrachaService {
  private logger = new Logger(ContadorCrachaService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditoria: AuditoriaService,
  ) {}

  // CRIA UM NOVO CONTADOR A CADA CRIAÇÃO DE EMPRESA - serviço executado dentro do sistema
  async create(
    create: CreateContadorCrachaDto,
    tx?: Prisma.TransactionClient,
  ): Promise<ContadorCracha> {
    try {
      const executar = async (
        client: Prisma.TransactionClient | PrismaService,
      ) => {
        const { registradoPorId, ...dadosContador } = create;

        const criar = await client.contadorDeCracha.create({
          data: dadosContador,
        });

        const dados = ExtractDataAuditoria(criar);

        const dadosAuditoria: CreateAuditoriaDto = {
          entidade: 'CONTADOR_CRACHA',
          registroId: criar.id,
          acao: Acao.CREATE,
          dadosRegistrados: dados,
          empresaId: create.empresaId,
          registradoPorId: registradoPorId,
        };

        await this.auditoria.create(dadosAuditoria, client);

        return criar;
      };

      let criarContador: any;
      if (tx) {
        criarContador = await executar(tx);
      } else {
        criarContador = await this.prisma.$transaction(async (novaTx) => {
          return executar(novaTx);
        });
      }

      this.logger.log(TYPES_NOTICES.CREATE);
      return criarContador;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - CREATE');
      throw error;
    }
  }

  // LISTAGEM DE CONTADORES DE CRACHAS
  async findAll(
    query: QueryContadorCrachaFilterDto,
  ): Promise<ContadorCracha[]> {
    try {
      const condicao: Prisma.ContadorDeCrachaWhereInput = {};
      if (query.contador) condicao.contador = query.contador;
      if (query.empresaId) condicao.empresaId = query.empresaId;
      if (query.status) condicao.status = query.status;

      const listar = await this.prisma.contadorDeCracha.findMany({
        where: condicao,
      });

      if (listar.length === 0) {
        this.logger.warn(TYPES_NOTICES.EMPTY_LIST);
      }

      this.logger.log(TYPES_NOTICES.FIND_ALL);
      return listar;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE);
      throw error;
    }
  }
  // BUSCAR DE CONTADORES DE CRACHAS
  async findOne(id: string): Promise<ContadorCracha> {
    try {
      const buscar = await this.prisma.contadorDeCracha.findUnique({
        where: { id: id },
      });

      if (!buscar) {
        this.logger.warn(TYPES_NOTICES.NOT_FOUND);
        throw new NotFoundException();
      }

      this.logger.log(TYPES_NOTICES.FIND_ONE);
      return buscar;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - FINDONE');
      throw error;
    }
  }

  // BUSCAR CONTADOR DE CRACHA POR ID EMPRESA
  async findEnterprise(
    id: string,
    tx?: Prisma.TransactionClient,
  ): Promise<ResponseContadorEnterpriseDto> {
    try {
      const client = tx ?? this.prisma;
      const buscar = await client.contadorDeCracha.findFirst({
        where: { empresaId: id },
      });

      return plainToClass(ResponseContadorEnterpriseDto, buscar);
    } catch (error) {
      this.logger.error('Falha na busca do contador de cracha.');
      throw error;
    }
  }

  // ATUALIZA O ATRIBUTO CONTADOR A CADA CADASTRO DE UM NOVO USUARIO DA EMPRESA CADASTRANTE
  async update(update: UpdateContadorCrachaDto): Promise<ContadorCracha> {
    try {
      const atualizarContador = await this.prisma.$transaction(async (tx) => {
        const { empresaId, registradoPorId } = update;
        this.logger.debug(empresaId);

        const buscar = await this.findEnterprise(empresaId, tx);

        const antes = ExtractDataAuditoria(buscar);

        const atualizar = await tx.contadorDeCracha.update({
          where: { id: buscar.id },
          data: { contador: { increment: 1 } },
        });

        const depois = await ExtractDataAuditoria(atualizar);
        const dadosAuditoria: UpdateAuditoriaDto = {
          entidade: 'CONTADOR_CRACHA',
          registroId: buscar.id,
          acao: Acao.UPDATE,
          antes: antes,
          depois: depois,
          empresaId: empresaId,
          registradoPorId: registradoPorId,
        };
        await this.auditoria.update(dadosAuditoria, tx);

        return atualizar;
      });

      this.logger.log(TYPES_NOTICES.UPDATE);
      return atualizarContador;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - UPDATE');
      throw error;
    }
  }
  // INATIVA O CONTADOR DE CRACHAS ATRAVES DA INATIVAÇÃO DA EMPRESA
  async deactive(
    empresaId: string,
    autenticado: Auth,
    tx?: Prisma.TransactionClient,
  ): Promise<ContadorCracha> {
    try {
      const executar = async (
        client: Prisma.TransactionClient | PrismaService,
      ) => {
        const buscar = await this.findEnterprise(empresaId, client);

        const antes = ExtractDataAuditoria(buscar);

        const inativar = await client.contadorDeCracha.update({
          where: { id: buscar.id },
          data: { status: false },
        });

        const depois = ExtractDataAuditoria(inativar);

        const dadosAtualizados: UpdateAuditoriaDto = {
          entidade: 'CONTADOR_CRACHA',
          registroId: empresaId,
          acao: Acao.UPDATE,
          antes: antes,
          depois: depois,
          empresaId: autenticado.empresa,
          registradoPorId: autenticado.userId,
        };

        await this.auditoria.update(dadosAtualizados, client);

        return inativar;
      };

      let inativarContador: any;
      if (tx) {
        inativarContador = await executar(tx);
      } else {
        inativarContador = await this.prisma.$transaction(async (novaTx) => {
          return executar(novaTx);
        });
      }

      this.logger.log(TYPES_NOTICES.UPDATE);
      return inativarContador;
    } catch (error) {
      this.logger.error('Falha ao inativar o contador de cracha.');
      throw error;
    }
  }
  // REMOVER DADO DO BANCO PELO ID
  async remove(
    empresaId: string,
    autenticado: Auth,
    tx?: Prisma.TransactionClient,
  ): Promise<ContadorCracha> {
    try {
      const executar = async (
        client: Prisma.TransactionClient | PrismaService,
      ) => {
        const buscar = await this.findEnterprise(empresaId, client);

        const remover = await client.contadorDeCracha.delete({
          where: { id: buscar.id },
        });

        const dados = ExtractDataAuditoria(remover);

        const dadosAuditoria: CreateAuditoriaDto = {
          entidade: 'CONTADOR_CRACHA',
          registroId: buscar.id,
          acao: Acao.DELETE,
          dadosRegistrados: dados,
          empresaId: empresaId,
          registradoPorId: autenticado.userId,
        };

        await this.auditoria.create(dadosAuditoria, client);
      };

      let removerContador: any;
      if (tx) {
        removerContador = await executar(tx);
      } else {
        removerContador = await this.prisma.$transaction(async (novatx) => {
          return executar(novatx);
        });
      }

      return removerContador;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - REMOVE');
      throw error;
    }
  }
}
