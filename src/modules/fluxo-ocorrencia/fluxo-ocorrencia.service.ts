import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateFluxoOcorrenciaDto } from './dto/create-fluxo-ocorrencia.dto';
import { UpdateFluxoOcorrenciaDto } from './dto/update-fluxo-ocorrencia.dto';
import { PrismaService } from '@/prisma/prisma.service';
import {
  FluxoOcorrencia,
  FluxoOcorrenciaListagem,
} from './entities/fluxo-ocorrencia.entity';
import { TYPES_NOTICES } from '@/utils/types-notices.cosnt';
import { QueryFluxoOcorrenciaFilterDto } from './dto/query-fluxo-ocorrencia.dto';
import { Acao, Prisma } from '@/generated/prisma/client';
import {
  ConsultaConfig,
  ConsultaFluxoOcorrencia,
  CONSULTAS,
  DESVIOS,
} from '@/constants/query-fluxo-ocorrencia.const';
import { PaginatedResponse } from '@/interfaces/paginator.interface';

const LIMITE_LISTA_COMPLETA = 100;

@Injectable()
export class FluxoOcorrenciaService {
  private logger = new Logger(FluxoOcorrenciaService.name);

  constructor(private prisma: PrismaService) {}

  async create(
    create: CreateFluxoOcorrenciaDto,
    tx?: Prisma.TransactionClient,
  ): Promise<FluxoOcorrencia> {
    try {
      const client = tx ?? this.prisma.client;
      const criar = await client.fluxoOcorrencia.create({
        data: create,
      });
      this.logger.log(TYPES_NOTICES.CREATE);
      return criar;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - CREATE');
      throw error;
    }
  }

  private toAssembleCondicao(
    filtros: QueryFluxoOcorrenciaFilterDto,
  ): Prisma.FluxoOcorrenciaWhereInput {
    const condicao: Prisma.FluxoOcorrenciaWhereInput = {};

    if (filtros.codigo) condicao.ocorrencia = { codigo: filtros.codigo };
    if (filtros.ocorrenciaId) condicao.ocorrenciaId = filtros.ocorrenciaId;
    if (filtros.usuarioId) condicao.usuarioId = filtros.usuarioId;
    if (filtros.transferidoPerfilId)
      condicao.transferidoPerfilId = filtros.transferidoPerfilId;

    if (filtros.dataInicial || filtros.dataFinal) {
      const periodo: Prisma.DateTimeNullableFilter = {};
      if (filtros.dataInicial) periodo.gte = filtros.dataInicial;
      if (filtros.dataFinal) periodo.lte = filtros.dataFinal;
    }

    if (filtros.duracao) condicao.duracao = filtros.duracao;
    if (filtros.status !== undefined) condicao.status = filtros.status;

    return condicao;
  }

  private resolverConfig(consulta?: ConsultaFluxoOcorrencia): ConsultaConfig {
    return consulta ? CONSULTAS[consulta] : CONSULTAS.fluxo_padrao;
  }

  private toAssembleQuery(
    query: QueryFluxoOcorrenciaFilterDto,
  ): Prisma.FluxoOcorrenciaFindManyArgs {
    const desvios = query.desvios ? DESVIOS[query.desvios]() : undefined;
    const filtros = this.toAssembleCondicao(query);

    return {
      ...this.resolverConfig(query.consulta),
      where: desvios ? { AND: [desvios, filtros] } : filtros,
    };
  }

  async findAllPagination(
    query: QueryFluxoOcorrenciaFilterDto,
    tx?: Prisma.TransactionClient,
  ): Promise<PaginatedResponse<FluxoOcorrenciaListagem>> {
    try {
      const client = tx ?? this.prisma.client;
      const pagina = query.page ?? 1;
      const tamanho = query.size ?? 10;
      const base = this.toAssembleQuery(query);

      const [listar, total] = await client.$transaction([
        client.fluxoOcorrencia.findMany({
          ...base,
          skip: (pagina - 1) * tamanho,
          take: tamanho,
        }),
        client.fluxoOcorrencia.count({ where: base.where }),
      ]);

      if (listar.length === 0) {
        this.logger.warn(TYPES_NOTICES.EMPTY_LIST);
      }

      this.logger.log(TYPES_NOTICES.FIND_ALL);
      return { dados: listar, total, pagina, tamanho };
    } catch (error) {
      this.logger.error(
        TYPES_NOTICES.SERVICE_FAILURE,
        ' - findAllPagination()',
      );
      throw error;
    }
  }

  async findAllList(
    query: QueryFluxoOcorrenciaFilterDto,
    tx?: Prisma.TransactionClient,
  ): Promise<FluxoOcorrenciaListagem[]> {
    try {
      const client = tx ?? this.prisma.client;

      const listar = await client.fluxoOcorrencia.findMany({
        ...this.toAssembleQuery(query),
        take: LIMITE_LISTA_COMPLETA,
      });

      if (listar.length === 0) {
        this.logger.warn(TYPES_NOTICES.EMPTY_LIST);
      }
      this.logger.log(TYPES_NOTICES.FIND_ALL);

      return listar;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - findAllList()');
      throw error;
    }
  }

  async findOneFirst(
    query: QueryFluxoOcorrenciaFilterDto,
    tx?: Prisma.TransactionClient,
  ): Promise<FluxoOcorrenciaListagem | null> {
    try {
      const client = tx ?? this.prisma.client;
      const dados = this.toAssembleQuery(query);
      this.logger.debug(dados);

      const buscar = await client.fluxoOcorrencia.findFirst(dados);
      this.logger.debug(buscar);

      if (!buscar) {
        this.logger.warn(TYPES_NOTICES.NOT_FOUND);
      }

      return buscar;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - findOneFirst()');
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
