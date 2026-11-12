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

          /* DUPLICIDADE: impede dois registros do mesmo tipo no mesmo dia 
          (ex.: segunda ENTRADA_EXPEDIENTE ou segundo RETORNO_INTERVALO) */
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

  /* FUNÇÃO AUXILIAR - BUSCA O REGISTRO DE ENTRADA NO INTERVALO DO DIA CORREÇÃO DE FUSO: 
   a janela do dia usa o dia civil DE BRASÍLIA (janelaDiaBrasilia) e não o fuso do servidor. 
   O padrão anterior (setHours(0,0,0,0)) zerava as horas no fuso onde o servidor roda:
   em UTC, meia-noite UTC equivale a 21:00 do dia anterior em Brasília,
   deslocando a busca em 3h e podendo perder a SAIDA_INTERVALO gravada
   perto da virada do dia (turno noturno). */
  private async searchEntryInterval(
    usuarioId: string,
    dataRegistro: Date,
    tx?: Prisma.TransactionClient,
  ): Promise<Date | undefined> {
    try {
      const client = tx ?? this.prisma.client;

      /* Janela do dia civil de Brasília que contém o instante do registro:
     inicio = 00:00:00.000-03:00 e fim = 23:59:59.999-03:00 desse dia */
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

  /* FUNÇÃO AUXILIAR - VERIFICAÇÃO DE USUÁRIO
   Valida se o usuário pode registrar a jornada na tag informada.
   Executa 3 checagens e retorna true apenas se TODAS passarem:
     1. TURNO: o turno do usuário precisa ser o turno atual do sistema
        (exceto em SAIDA_EXPEDIENTE, liberado dessa regra);
     2. PERFIL: o perfil precisa ser "OPERADOR";
     3. ALOCAÇÃO: precisa existir alocação ATIVA e ALOCADA para a tag
        no turno atual, e o operador alocado deve ser o próprio usuário.
   Qualquer reprovação loga o motivo específico e retorna false, o que
   faz o create() lançar UnauthorizedException e abortar o registro. */
  private async searchOperatorUser(
    usuarioId: string,
    tagAtivoId: string,
    turno: TipoTurno,
    tipoJornada: TipoJornada,
  ): Promise<boolean> {
    /* Busca o usuário e o perfil vinculado a ele.
     O "!" (non-null assertion) assume que todo usuário tem perfilId */
    const usuario = await this.usuarioService.findOne(usuarioId);
    const perfil = await this.perfilService.findOne(usuario.perfilId!);

    /* Monta o filtro de alocação: alguém ALOCADO na tag informada,
     no turno atual, com alocação ativa (status true) */
    const queryA: QueryAlocacaoOperacionalFilterDto = {
      tagAtivoId: tagAtivoId,
      situacao: SituacaoAlocacao.ALOCADO,
      turno: turno,
      status: true,
    };

    /* Retorna a alocação ativa da tag no turno (ou undefined se a tag
     estiver sem operador naquele turno) */
    const alocacao = await this.alocacaoService.findOneAllocation(queryA);

    /* CHECAGEM 1 - TURNO: true quando o turno do usuário DIFERE do turno
     atual E o registro NÃO é SAIDA_EXPEDIENTE (tipo isento da regra,
     para permitir a saída no fim do expediente mesmo com o sistema já
     em outro turno) */
    const isTurno =
      usuario.turno !== turno && tipoJornada !== TipoJornada.SAIDA_EXPEDIENTE;

    /* CHECAGEM 2 - PERFIL: true quando o perfil NÃO é OPERADOR */
    const isOperador = perfil.descricao !== 'OPERADOR';

    /* CHECAGEM 3 - ALOCAÇÃO: true quando não há alocação ativa na tag
     OU a alocação encontrada pertence a OUTRO operador (a busca não
     filtra por usuário, por isso a comparação de operadorId confere
     se o alocado é este usuário) */
    const isAlocado = !alocacao || alocacao.operadorId !== usuarioId;

    /* BASTA UMA reprovação para barrar o registro ( OU ) */
    const isControle = isTurno || isOperador || isAlocado;

    if (isControle) {
      /* Loga cada motivo reprovado individualmente, facilitando
       diagnóstico e auditoria sem precisar abrir o depurador */
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
    /* Todas as checagens passaram: usuário autorizado a registrar */
    return true;
  }

  /* FUNÇÃO AUXILIAR - VALIDA DUPLICIDADE DE JORNADA NO DIA
   Retorna true se o usuário JÁ possui um registro do mesmo tipoJornada
   dentro do dia civil consultado; false caso contrário.
   Janela de busca segue a mesma correção de fuso do searchEntryInterval:
   dia civil DE BRASÍLIA (janelaDiaBrasilia), imune ao fuso do servidor
   (o padrão setHours(0,0,0,0) deslocaria a busca em até 3h em UTC). */
  private async searchDailyJourney(
    usuarioId: string,
    tipoJornada: TipoJornada,
    dataRegistro: Date,
    tx?: Prisma.TransactionClient,
  ): Promise<boolean> {
    try {
      const client = tx ?? this.prisma.client;

      /* Janela do dia civil de Brasília que contém o instante do registro:
       inicio = 00:00:00.000-03:00 e fim = 23:59:59.999-03:00 desse dia */
      const { inicio: inicioDia, fim: fimDia } =
        janelaDiaBrasilia(dataRegistro);

      /* findFirst com select mínimo: basta saber SE existe, não o registro
       inteiro; consulta mais leve e sem tráfego desnecessário */
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
      const dados = this.toAssembleQuery(query);
      this.logger.debug(dados);

      const buscar = await client.controleJornada.findFirst(
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
