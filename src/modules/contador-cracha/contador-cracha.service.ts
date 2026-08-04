import { Acao, Prisma } from '@/generated/prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import { TYPES_NOTICES } from '@/utils/types-notices.cosnt';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { CreateContadorCrachaDto } from './dto/create-contador-cracha.dto';
import { QueryContadorCrachaFilterDto } from './dto/query-contador-cracha.dto';
import { ResponseContadorEnterpriseDto } from './dto/response-contador-cracha.dto';
import { UpdateContadorCrachaDto } from './dto/update-contador-cracha.dto';
import { ContadorCracha } from './entities/contador-cracha.entity';

@Injectable()
export class ContadorCrachaService {
  private logger = new Logger(ContadorCrachaService.name);

  constructor(private readonly prisma: PrismaService) {}

  /*
  CRIA UM NOVO CONTADOR A CADA CRIAÇÃO DE EMPRESA: 
  - serviço executado dentro do sistema
  - sem requisição http.
  - vinculada a criação da empresa.
  */
  async create(
    create: CreateContadorCrachaDto,
    tx?: Prisma.TransactionClient,
  ): Promise<ContadorCracha> {
    try {
      const client = tx ?? this.prisma.client;

      const criar = await client.contadorDeCracha.create({
        data: create,
      });

      this.logger.log(TYPES_NOTICES.CREATE);
      return criar;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - CREATE');
      throw error;
    }
  }

  /*
  LISTAGEM DE CONTADORES DE CRACHAS:
  - apenas listagem com filtro.
  - apenas por requisição.
  */
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
  /*
  BUSCAR DE CONTADORES DE CRACHAS:
  - busca atraves do id. 
  - apenas por requisição.
  */
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

  /*
  BUSCAR CONTADOR DE CRACHA POR ID EMPRESA:
  - serviço de busca interna.
  - sem requisição http.
  - busca atravez do id da empresa.
  */
  async findEnterprise(
    id: string,
    tx?: Prisma.TransactionClient,
  ): Promise<ContadorCracha> {
    try {
      const client = tx ?? this.prisma.client;
      const buscar = await client.contadorDeCracha.findFirst({
        where: { empresaId: id },
      });

      return buscar;
    } catch (error) {
      this.logger.error('Falha na busca do contador de cracha.');
      throw error;
    }
  }

  /*
  ATUALIZA O ATRIBUTO CONTADOR A CADA CADASTRO DE UM NOVO USUARIO DA EMPRESA CADASTRANTE:
  - serviço de atualização interna.
  - sem requisição http.
  */
  async update(
    update: UpdateContadorCrachaDto,
    tx?: Prisma.TransactionClient,
  ): Promise<ContadorCracha> {
    try {
      const client = tx ?? this.prisma.client;

      const buscar = await this.findEnterprise(update.empresaId, tx);

      const atualizar = await client.contadorDeCracha.update({
        where: { id: buscar.id },
        data: { contador: buscar.contador + 1 },
      });

      this.logger.log(TYPES_NOTICES.UPDATE);
      return atualizar;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - UPDATE');
      throw error;
    }
  }
  /*
  INATIVA O CONTADOR DE CRACHAS ATRAVES DA INATIVAÇÃO DA EMPRESA:
  - serviço inativação interno.
  - sem requisição http.
  - vinculada a inativação da empresa.
  */
  async deactive(
    empresaId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<ContadorCracha> {
    try {
      const client = tx ?? this.prisma.client;

      const buscar = await this.findEnterprise(empresaId, client);

      const inativar = await client.contadorDeCracha.update({
        where: { id: buscar.id },
        data: { status: false, _auditAction: Acao.DEACTIVATE },
      });

      this.logger.log(TYPES_NOTICES.UPDATE);
      return inativar;
    } catch (error) {
      this.logger.error('Falha ao inativar o contador de cracha.');
      throw error;
    }
  }
  /*
  REMOVER DADO DO BANCO PELO ID: 
  - serviço de remoção interno.
  - sem requisição http.
  - vinculado a remoção de empresa.
  */
  async remove(
    empresaId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<ContadorCracha> {
    try {
      const client = tx ?? this.prisma.client;

      const buscar = await this.findEnterprise(empresaId, client);

      const remover = await client.contadorDeCracha.delete({
        where: { id: buscar.id },
      });

      this.logger.log(TYPES_NOTICES.DELETE);
      return remover;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - REMOVE');
      throw error;
    }
  }
}
