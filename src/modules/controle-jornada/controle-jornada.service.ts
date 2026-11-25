import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateControleJornadaDto } from './dto/create-controle-jornada.dto';
import { UpdateControleJornadaDto } from './dto/update-controle-jornada.dto';
import { PrismaService } from '@/prisma/prisma.service';
import {
  ControleJornada,
  ControleJornadaListagem,
} from './entities/controle-jornada.entity';
import { TYPES_NOTICES } from '@/utils/types-notices.cosnt';
import { QueryControleJornadaFilterDto } from './dto/query-controle-jornada.dto';
import {
  Acao,
  Prisma,
  SituacaoAlocacao,
  TipoJornada,
  TipoTurno,
} from '@/generated/prisma/client';
import { GeradorTurnoService } from '../gerador-turno/gerador-turno.service';
import { UsuarioService } from '../usuario/usuario.service';
import { PerfilService } from '../perfil/perfil.service';
import { AlocacaoService } from '../alocacao/alocacao.service';
import { QueryAlocacaoOperacionalFilterDto } from '../alocacao/dto/query-alocacao.dto';
import { janelaDiaBrasilia } from '@/utils/data-brasilia.util';
import { avaliarEstadoJornada } from '@/utils/verificar-tolerancia-horario.util';
import { PaginatedResponse } from '@/interfaces/paginator.interface';
import {
  ConsultaConfig,
  ConsultaControleJornada,
  CONSULTAS,
  DESVIOS,
} from '@/constants/query-controle-jornada.const';

const LIMITE_LISTA_COMPLETA = 100;

@Injectable()
export class ControleJornadaService {
  private logger = new Logger(ControleJornadaService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly usuarioService: UsuarioService,
    private readonly perfilService: PerfilService,
    private readonly alocacaoService: AlocacaoService,
    private readonly geradorTurnoService: GeradorTurnoService,
  ) {}

  async create(create: CreateControleJornadaDto): Promise<ControleJornada> {
    try {
      const criarControle = await this.prisma.client.$transaction(
        async (tx: any) => {
          const { tipoJornada, usuarioId, tagAtivoId } = create;
          const dataRegistro = new Date();
          const turno = await this.geradorTurnoService.getTurnoAtual();

          const isOperador = await this.searchOperatorUser(
            usuarioId,
            tagAtivoId,
            turno.turno,
            tipoJornada,
          );

          if (!isOperador) {
            this.logger.warn(
              `Usuário ${usuarioId} não possui as credenciais necessárias para o cadastro!`,
            );
            throw new UnauthorizedException(
              `Usuário ${usuarioId} não possui as credenciais necessárias para o cadastro!`,
            );
          }

          const jaRegistrado = await this.searchDailyJourney(
            usuarioId,
            tipoJornada,
            dataRegistro,
            tx,
          );

          if (jaRegistrado) {
            this.logger.warn(
              `Usuário ${usuarioId} já possui registro de ${tipoJornada} no dia!`,
            );
            throw new ConflictException(
              `Usuário ${usuarioId} já possui registro de ${tipoJornada} no dia!`,
            );
          }

          const entradaIntervalo =
            tipoJornada === TipoJornada.RETORNO_INTERVALO
              ? await this.searchEntryInterval(usuarioId, dataRegistro, tx)
              : undefined;

          this.logger.debug(
            `Tipo Jornada: ${tipoJornada} - Data Registro${dataRegistro} - Entrada Intervalo${entradaIntervalo}`,
            'Turno: ',
            turno,
          );

          const estadoJornada = avaliarEstadoJornada(
            tipoJornada,
            dataRegistro,
            turno,
            entradaIntervalo,
          );
          this.logger.debug(
            `Estado da jornada: ${estadoJornada} - Tipo: ${tipoJornada}`,
          );

          const criar = await tx.controleJornada.create({
            data: {
              ...create,
              dataRegistro: dataRegistro,
              estadoJornada: estadoJornada,
            },
          });

          this.logger.log(TYPES_NOTICES.CREATE);
          return criar;
        },
      );

      this.logger.log(TYPES_NOTICES.CREATE);
      return criarControle;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - CREATE');
      throw error;
    }
  }

  private async searchEntryInterval(
    usuarioId: string,
    dataRegistro: Date,
    tx?: Prisma.TransactionClient,
  ): Promise<Date | undefined> {
    try {
      const client = tx ?? this.prisma.client;

      const { inicio: inicioDia, fim: fimDia } =
        janelaDiaBrasilia(dataRegistro);

      const registro = await client.controleJornada.findFirst({
        where: {
          usuarioId,
          tipoJornada: TipoJornada.SAIDA_INTERVALO,
          dataRegistro: { gte: inicioDia, lt: fimDia },
        },
        orderBy: { dataRegistro: 'desc' },
      });

      return registro?.dataRegistro;
    } catch (error) {
      this.logger.error(
        TYPES_NOTICES.SERVICE_FAILURE,
        ' - searchDailyJourney()',
      );
      throw error;
    }
  }

  private async searchOperatorUser(
    usuarioId: string,
    tagAtivoId: string,
    turno: TipoTurno,
    tipoJornada: TipoJornada,
  ): Promise<boolean> {
    const usuario = await this.usuarioService.findOne(usuarioId);
    const perfil = await this.perfilService.findOne(usuario.perfilId!);

    const queryA: QueryAlocacaoOperacionalFilterDto = {
      tagAtivoId: tagAtivoId,
      situacao: SituacaoAlocacao.ALOCADO,
      turno: turno,
      status: true,
    };

    const alocacao = await this.alocacaoService.findOneAllocation(queryA);

    const isTurno =
      usuario.turno !== turno && tipoJornada !== TipoJornada.SAIDA_EXPEDIENTE;

    const isOperador = perfil.descricao !== 'OPERADOR';

    const isAlocado = !alocacao || alocacao.operadorId !== usuarioId;

    const isControle = isTurno || isOperador || isAlocado;

    if (isControle) {
      if (isTurno)
        this.logger.warn(
          `Usuário ${usuarioId} não pertence ao turno da ${turno}!`,
        );
      if (isOperador)
        this.logger.warn(
          `Usuário ${usuarioId} não pertence ao perfil da OPERADOR!`,
        );
      if (isAlocado)
        this.logger.warn(
          `Usuário ${usuarioId} não está alocado na tag id ${tagAtivoId}!`,
        );
      return false;
    }
    return true;
  }

  private async searchDailyJourney(
    usuarioId: string,
    tipoJornada: TipoJornada,
    dataRegistro: Date,
    tx?: Prisma.TransactionClient,
  ): Promise<boolean> {
    try {
      const client = tx ?? this.prisma.client;

      const { inicio: inicioDia, fim: fimDia } =
        janelaDiaBrasilia(dataRegistro);

      const registro = await client.controleJornada.findFirst({
        where: {
          usuarioId,
          tipoJornada,
          dataRegistro: { gte: inicioDia, lt: fimDia },
          status: true,
        },
        select: { id: true },
      });

      return !!registro;
    } catch (error) {
      this.logger.error(
        TYPES_NOTICES.SERVICE_FAILURE,
        ' - searchDailyJourney()',
      );
      throw error;
    }
  }

  private toAssembleCondicao(
    filtros: QueryControleJornadaFilterDto,
  ): Prisma.ControleJornadaWhereInput {
    const condicao: Prisma.ControleJornadaWhereInput = {};

    if (filtros.codigo) condicao.codigo = filtros.codigo;
    if (filtros.usuarioId) condicao.usuarioId = filtros.usuarioId;
    if (filtros.tagAtivoId) condicao.tagAtivoId = filtros.tagAtivoId;
    if (filtros.tipoJornada) condicao.tipoJornada = filtros.tipoJornada;
    if (filtros.estadoJornada) condicao.estadoJornada = filtros.estadoJornada;
    if (filtros.status !== undefined) condicao.status = filtros.status;
    if (filtros.dataRegistro) {
      condicao.dataRegistro = { lte: filtros.dataRegistro };
    }

    return condicao;
  }

  private resolverConfig(consulta?: ConsultaControleJornada): ConsultaConfig {
    return consulta ? CONSULTAS[consulta] : CONSULTAS.jornada_resumo;
  }

  private toAssembleQuery(
    query: QueryControleJornadaFilterDto,
  ): Prisma.ControleJornadaFindManyArgs {
    const desvios = query.desvios ? DESVIOS[query.desvios]() : undefined;
    const filtros = this.toAssembleCondicao(query);

    return {
      ...this.resolverConfig(query.consulta),
      where: desvios ? { AND: [desvios, filtros] } : filtros,
    };
  }

  async findAllPagination(
    query: QueryControleJornadaFilterDto,
    tx?: Prisma.TransactionClient,
  ): Promise<PaginatedResponse<ControleJornadaListagem>> {
    try {
      const client = tx ?? this.prisma.client;
      const pagina = query.page ?? 1;
      const tamanho = query.size ?? 10;
      const base = this.toAssembleQuery(query);

      const [listar, total] = await client.$transaction([
        client.controleJornada.findMany({
          ...base,
          skip: (pagina - 1) * tamanho,
          take: tamanho,
        }),
        client.controleJornada.count({ where: base.where }),
      ]);

      if (listar.length === 0) {
        this.logger.warn(TYPES_NOTICES.EMPTY_LIST);
      }
      this.logger.log(TYPES_NOTICES.FIND_ALL);

      return { dados: listar, total, pagina, tamanho };
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - FINDALL');
      throw error;
    }
  }

  async findAllList(
    query: QueryControleJornadaFilterDto,
    tx?: Prisma.TransactionClient,
  ): Promise<ControleJornadaListagem[]> {
    try {
      const client = tx ?? this.prisma.client;

      const listar = await client.controleJornada.findMany({
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
    query: QueryControleJornadaFilterDto,
    tx?: Prisma.TransactionClient,
  ): Promise<ControleJornadaListagem | null> {
    try {
      const client = tx ?? this.prisma.client;

      const buscar = await client.controleJornada.findFirst(
        this.toAssembleQuery(query),
      );
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
  ): Promise<ControleJornada> {
    try {
      const client = tx ?? this.prisma.client;
      const buscar = await client.controleJornada.findUnique({
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
    updateControleJornadaDto: UpdateControleJornadaDto,
  ): Promise<ControleJornada> {
    try {
      const atualizarJornada = await this.prisma.client.$transaction(
        async (tx: any) => {
          await this.findOne(id, tx);

          const atualizar = await tx.controleJornada.update({
            where: { id: id },
            data: updateControleJornadaDto,
          });

          return atualizar;
        },
      );

      this.logger.log(TYPES_NOTICES.UPDATE);
      return atualizarJornada;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - UPDATE');
      throw error;
    }
  }

  async deactive(id: string): Promise<ControleJornada> {
    try {
      const inativarJornada = await this.prisma.client.$transaction(
        async (tx: any) => {
          const verificar = await this.findOne(id, tx);

          if (!verificar.status) {
            this.logger.warn(TYPES_NOTICES.IS_DEACTIVE);
            throw new UnauthorizedException(TYPES_NOTICES.IS_DEACTIVE);
          }

          const inativar = await tx.controleJornada.update({
            where: { id: id },
            data: { status: false, _auditAction: Acao.DEACTIVATE },
          });

          return inativar;
        },
      );

      this.logger.log(TYPES_NOTICES.DEACTIVE);
      return inativarJornada;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - DEACTIVE');
      throw error;
    }
  }

  async remove(id: string): Promise<ControleJornada> {
    try {
      const removerJornada = await this.prisma.client.$transaction(
        async (tx: any) => {
          const verificar = await this.findOne(id, tx);

          if (verificar.status) {
            this.logger.warn(TYPES_NOTICES.UNAUTHORIZED);
            throw new UnauthorizedException(TYPES_NOTICES.UNAUTHORIZED);
          }

          const remover = await tx.controleJornada.delete({
            where: { id: id },
          });

          return remover;
        },
      );

      this.logger.log(TYPES_NOTICES.DELETE);
      return removerJornada;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - REMOVE');
      throw error;
    }
  }
}
