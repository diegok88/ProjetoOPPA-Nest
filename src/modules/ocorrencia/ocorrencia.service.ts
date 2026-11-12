import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateOcorrenciaDto } from './dto/create-ocorrencia.dto';
import { UpdateOcorrenciaDto } from './dto/update-ocorrencia.dto';
import { PrismaService } from '@/prisma/prisma.service';
import {
  Ocorrencia,
  OcorrenciaListagem,
  OcorrenciaRelacao,
} from './entities/ocorrencia.entity';
import { TYPES_NOTICES } from '@/utils/types-notices.cosnt';
import { Acao, Prisma } from '@/generated/prisma/client';
import { QueryOcorrenciaFilterDto } from './dto/query-ocorrencia.dto';
import {
  ConsultaConfig,
  ConsultaOcorrencia,
  CONSULTAS,
  DESVIOS,
} from '@/constants/query-ocorrencia.const';
import { PaginatedResponse } from '@/interfaces/paginator.interface';
import { FluxoOcorrenciaService } from '../fluxo-ocorrencia/fluxo-ocorrencia.service';
import { CreateFluxoOcorrenciaDto } from '../fluxo-ocorrencia/dto/create-fluxo-ocorrencia.dto';

const LIMITE_LISTA_COMPLETA = 100;

export interface UpdateOcorrenciaInternoDto {
  dataFalhaRegistrado?: Date;
  statusFalha?: boolean;
  dataFinal?: Date;
}

@Injectable()
export class OcorrenciaService {
  private logger = new Logger(OcorrenciaService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly fluxoOcorrenciaService: FluxoOcorrenciaService,
  ) {}

  async create(
    create: CreateOcorrenciaDto,
    tx?: Prisma.TransactionClient,
  ): Promise<Ocorrencia> {
    try {
      const client = tx ?? this.prisma.client;
      const criar = await client.ocorrencia.create({
        data: { ...create },
      });
      this.logger.log(TYPES_NOTICES.CREATE);
      return criar;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - CREATE');
      throw error;
    }
  }

  private toAssembleCondicao(
    filtros: QueryOcorrenciaFilterDto,
  ): Prisma.OcorrenciaWhereInput {
    const condicao: Prisma.OcorrenciaWhereInput = {};
    if (filtros.codigo) condicao.codigo = filtros.codigo;
    if (filtros.estadoAtivoId) condicao.estadoAtivoId = filtros.estadoAtivoId;
    if (filtros.tagAtivoId)
      condicao.estadoAtivo = { tagAtivoId: filtros.tagAtivoId };
    if (filtros.falhaId) condicao.falhaId = filtros.falhaId;
    if (filtros.solucaoId) condicao.solucaoId = filtros.solucaoId;
    if (filtros.tipoOcorrencia)
      condicao.tipoOcorrencia = filtros.tipoOcorrencia;
    if (filtros.condicaoOcorrencia)
      condicao.condicaoOcorrencia = filtros.condicaoOcorrencia;
    if (filtros.solucionadoId) condicao.solucionadoId = filtros.solucionadoId;
    if (filtros.dataInicial)
      condicao.dataInicial = { lte: filtros.dataInicial };
    if (filtros.dataFalhaRegistrado)
      condicao.dataFalhaRegistrado = { lte: filtros.dataFalhaRegistrado };
    if (filtros.dataFinal) condicao.dataFinal = { lte: filtros.dataFinal };
    if (filtros.statusFalha !== undefined)
      condicao.statusFalha = filtros.statusFalha;
    if (filtros.status !== undefined) condicao.status = filtros.status;

    return condicao;
  }

  private resolverConfig(consulta?: ConsultaOcorrencia): ConsultaConfig {
    return consulta ? CONSULTAS[consulta] : CONSULTAS.ocorrencia_padrao;
  }

  private toAssembleQuery(
    query: QueryOcorrenciaFilterDto,
  ): Prisma.OcorrenciaFindManyArgs {
    const desvios = query.desvios ? DESVIOS[query.desvios]() : undefined;
    const filtros = this.toAssembleCondicao(query);

    return {
      ...this.resolverConfig(query.consulta),
      where: desvios ? { AND: [desvios, filtros] } : filtros,
    };
  }

  async findAllPagination(
    query: QueryOcorrenciaFilterDto,
    tx?: Prisma.TransactionClient,
  ): Promise<PaginatedResponse<OcorrenciaListagem>> {
    try {
      const client = tx ?? this.prisma.client;
      const pagina = query.page ?? 1;
      const tamanho = query.size ?? 10;
      const base = this.toAssembleQuery(query);

      const [listar, total] = await client.$transaction([
        client.ocorrencia.findMany({
          ...base,
          skip: (pagina - 1) * tamanho,
          take: tamanho,
        }),
        client.ocorrencia.count({ where: base.where }),
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
    query: QueryOcorrenciaFilterDto,
    tx?: Prisma.TransactionClient,
  ): Promise<OcorrenciaListagem[]> {
    try {
      const client = tx ?? this.prisma.client;

      const listar = await client.ocorrencia.findMany({
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
    query: QueryOcorrenciaFilterDto,
    tx?: Prisma.TransactionClient,
  ): Promise<OcorrenciaListagem | null> {
    try {
      const client = tx ?? this.prisma.client;
      const dados = this.toAssembleQuery(query);
      this.logger.debug(dados);

      const buscar = await client.ocorrencia.findFirst(
        this.toAssembleQuery(query),
      );
      this.logger.debug(buscar);
      if (!buscar) {
        this.logger.warn(TYPES_NOTICES.NOT_FOUND);
      }

      return buscar;
    } catch (error) {
      this.logger.error(
        TYPES_NOTICES.SERVICE_FAILURE,
        ' - async findOneFirst()',
      );
      throw error;
    }
  }

  async findOne(
    id: string,
    tx?: Prisma.TransactionClient,
  ): Promise<OcorrenciaRelacao> {
    try {
      const client = tx ?? this.prisma.client;
      const buscar = await client.ocorrencia.findUnique({
        where: { id: id },
        include: {
          estadoAtivo: {
            include: { alocacaoOperacional: { include: { operador: true } } },
          },
          falhas: true,
          solucoes: true,
          solucionado: true,
        },
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

  async update(id: string, update: UpdateOcorrenciaDto): Promise<Ocorrencia> {
    try {
      const atualizarOcorrencia = await this.prisma.client.$transaction(
        async (tx: any) => {
          const ocorrencia = await this.findOne(id, tx);
          const internos: UpdateOcorrenciaInternoDto = {};

          const dados: Prisma.OcorrenciaUpdateInput = { ...internos };
          if (update.falhaId) {
            dados.falhas = { connect: { id: update.falhaId } };
          }
          if (update.solucaoId) {
            dados.solucoes = { connect: { id: update.solucaoId } };
          }
          if (update.solucionadoId) {
            dados.solucionado = { connect: { id: update.solucionadoId } };
          }
          if (update.tipoOcorrencia !== undefined) {
            dados.tipoOcorrencia = update.tipoOcorrencia;
          }

          const atualizar = await tx.ocorrencia.update({
            where: { id: id },
            data: dados,
          });

          if (atualizar.falhaId && update.falhaId && !ocorrencia.falhaId) {
            const perfil = await this.findOne(id, tx);
            internos.dataFalhaRegistrado = new Date();
            if (perfil.estadoAtivo.alocacaoOperacional.operador?.perfilId) {
              const fluxo: CreateFluxoOcorrenciaDto = {
                ocorrenciaId: atualizar.id,
                transferidoPerfilId:
                  perfil.estadoAtivo.alocacaoOperacional.operador.perfilId,
              };
              await this.fluxoOcorrenciaService.create(fluxo, tx);
            }
          }

          return atualizar;
        },
      );

      this.logger.log(TYPES_NOTICES.UPDATE);
      return atualizarOcorrencia;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - UPDATE');
      throw error;
    }
  }

  async deactive(id: string): Promise<Ocorrencia> {
    try {
      const inativarOcorrencia = await this.prisma.client.$transaction(
        async (tx: any) => {
          const verificar = await this.findOne(id, tx);

          if (!verificar.status) {
            this.logger.warn(TYPES_NOTICES.IS_DEACTIVE);
            throw new UnauthorizedException(TYPES_NOTICES.IS_DEACTIVE);
          }

          const inativar = await tx.ocorrencia.update({
            where: { id: id },
            data: { status: false, _auditAction: Acao.DEACTIVATE },
          });

          return inativar;
        },
      );

      this.logger.log(TYPES_NOTICES.DEACTIVE);
      return inativarOcorrencia;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - DEACTIVE');
      throw error;
    }
  }

  async remove(id: string): Promise<Ocorrencia> {
    try {
      const removerOcorrencia = await this.prisma.client.$transaction(
        async (tx: any) => {
          const verificar = await this.findOne(id, tx);

          if (verificar.status) {
            this.logger.warn(TYPES_NOTICES.UNAUTHORIZED);
            throw new UnauthorizedException(TYPES_NOTICES.UNAUTHORIZED);
          }

          const remover = await tx.ocorrencia.delete({
            where: { id: id },
          });

          return remover;
        },
      );

      this.logger.log(TYPES_NOTICES.DELETE);
      return removerOcorrencia;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - REMOVE');
      throw error;
    }
  }
}
