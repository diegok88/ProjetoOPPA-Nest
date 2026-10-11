import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateCompetenciaSetorialDto } from './dto/create-competencia-setorial.dto';
import { TenantContextService } from '@/auth/tenant-context/tenant-context.service';
import { PrismaService } from '@/prisma/prisma.service';
import {
  CompetenciaSetorial,
  CompetenciaSetorialRelacao,
} from './entities/competencia-setorial.entity';
import { TYPES_NOTICES } from '@/utils/types-notices.cosnt';
import { GestorService } from '../gestor/gestor.service';
import { Acao, Prisma } from '@/generated/prisma/client';
import { QueryGestorFilterDto } from '../gestor/dto/query-gestor.dto';
import { QueryCompetenciaSetorialFilterDto } from './dto/query-competencia-setorial.dto';
import { Contador } from '@/interfaces/counter.interface';
import { SetoresCompetencia } from '../setores/entities/setores.entity';
import { UsuarioService } from '../usuario/usuario.service';

@Injectable()
export class CompetenciaSetorialService {
  private logger = new Logger(CompetenciaSetorialService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly usuarioService: UsuarioService,
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
        const ctx = this.tenantContext.getStore()!;

        const usuario = await this.usuarioService.findOne(
          create.colaboradorId,
          tx,
        );

        /* verificação para não haver alocação de dois gestores do mesmo turno no setor */
        const queryCS: QueryCompetenciaSetorialFilterDto = {
          setorId: create.setorId,
          turno: usuario.turno!,
          status: true,
        };

        const alocacao = await this.findAll(queryCS, tx);

        if (alocacao.length > 0) {
          this.logger.warn(TYPES_NOTICES.UNAUTHORIZED);
          throw new UnauthorizedException(TYPES_NOTICES.UNAUTHORIZED);
        }

        /* busca o ultimo registro de competencia */
        const ultimo = await this.findLast(
          usuario.id,
          create.setorId,
          true,
          tx,
        );

        /* inativa o registro de competencia */
        if (ultimo) {
          await this.deactive(ultimo.id, tx);
        }

        /* query de consulta da lista de gestor */
        const queryU: QueryGestorFilterDto = {
          gestorId: usuario.id,
          status: true,
        };

        /* busca a lista do gestor atual */
        const listaGestor = await this.gestorService.findAll(queryU, tx);

        /* lista somente dos ids do gestor atual */
        const ids = listaGestor.map((lista) => lista.id);

        if (ids.length > 0) {
          /* inativa todos os colaboradores do gestor atual */
          await this.gestorService.deactiveAll(ids, tx);

          /* cria novo registro de gestor para os colaboradores cadastrador com gestor anterior */
          await this.gestorService.createAll(ids, create.colaboradorId, tx);
        }

        /* verifica se o gestor alocado pertence a gestão do alocador */
        const gestor = await this.gestorService.findId(
          usuario.id,
          ctx.user,
          tx,
        );

        if (usuario.turno !== gestor.colaborador.turno) {
          this.logger.warn(TYPES_NOTICES.NOT_SHIFT);
          throw new UnauthorizedException(TYPES_NOTICES.NOT_SHIFT);
        }
        /* cria a nova competência */
        const criar = await tx.competenciaSetorial.create({
          data: { ...create, gestorId: ctx.user, turno: usuario.turno },
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

  /* 
  FUNÇÃO RETORNA AS COMPETÊNCIAS SETORIAIS:
  - retorna os competências alocadas.
  - sendo que possui um query para filtro.
  - variavel que determina os campos de retorno.
  - variavel que determina os dados que ira retornar da relação.
  */
  async findAll(
    query: QueryCompetenciaSetorialFilterDto,
    tx?: Prisma.TransactionClient,
  ): Promise<CompetenciaSetorialRelacao[]> {
    try {
      let inclusao: boolean = false;

      const client = tx ?? this.prisma.client;

      const { campos, ...filtros } = query ?? {};

      const condicao: Prisma.CompetenciaSetorialWhereInput = {};
      if (filtros.colaboradorId) condicao.colaboradorId = filtros.colaboradorId;
      if (filtros.gestorId) condicao.gestorId = filtros.gestorId;
      if (filtros.setorId) condicao.setorId = filtros.setorId;
      if (filtros.turno) condicao.turno = filtros.turno;
      if (filtros.status !== undefined) condicao.status = filtros.status;
      // Validação separada para determinar o retorno de que tipo de dados
      if (filtros.incluir) inclusao = true;

      const selecao = await this.buildSelect(campos);

      const opcoes: Prisma.CompetenciaSetorialFindManyArgs = {
        where: condicao,
        orderBy: { colaboradorId: 'asc' },
      };

      if (campos?.length) {
        opcoes.select = selecao;
      } else {
        opcoes.include =
          filtros.incluir === 'setores_parcial'
            ? { setor: { select: { descricao: true } } }
            : { setor: inclusao };
      }

      const listar: CompetenciaSetorialRelacao[] =
        await client.competenciaSetorial.findMany(opcoes);

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

  /* 
  FUNÇÃO RETORNA OS SETORES QUE NÃO ESTÁ ALOCADOS:
  - retorna os setores que não possui alocação.
  - sendo parametro o id do colaborador que será alocado.
  - as condições possui o turno e o id do gestor.
  */
  async findSectionAvailable(id: string): Promise<SetoresCompetencia[]> {
    try {
      const ctx = this.tenantContext.getStore()!;

      const usuario = await this.usuarioService.findOne(id);

      const queryCS: QueryCompetenciaSetorialFilterDto = {
        gestorId: ctx.user,
        turno: usuario.turno!,
        status: true,
      };

      const competencia = await this.findAll(queryCS);
      const setoresOcupados = [
        ...new Set(
          competencia
            .filter((s) => s.gestorId === ctx.user)
            .map((s) => s.setorId),
        ),
      ];
      const condicao: Prisma.SetoresWhereInput = {
        ...(setoresOcupados.length ? { id: { notIn: setoresOcupados } } : {}),
        empresaId: ctx.empresa,
      };

      const setores = await this.prisma.setores.findMany({
        where: condicao,
        select: { id: true, codigo: true, descricao: true },
      });

      return setores;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - FINDALL');
      throw error;
    }
  }

  /* FUNÇÃO CONTADOR DE REGISTROS SENDO O TOTAL, ATIVOS E INATIVOS */
  async counter(): Promise<Contador> {
    try {
      const ctx = this.tenantContext.getStore()?.user;

      const total = await this.prisma.competenciaSetorial.count({
        where: { gestorId: ctx },
      });
      const ativos = await this.prisma.competenciaSetorial.count({
        where: { gestorId: ctx, status: true },
      });
      const inativos = await this.prisma.competenciaSetorial.count({
        where: { gestorId: ctx, status: false },
      });

      this.logger.log(TYPES_NOTICES.COUNTER);
      return { total, ativos, inativos };
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - COUNTER');
      throw error;
    }
  }

  async findOne(
    id: string,
    tx?: Prisma.TransactionClient,
  ): Promise<CompetenciaSetorialRelacao> {
    try {
      const client = tx ?? this.prisma.client;
      const buscar = await client.competenciaSetorial.findUnique({
        where: { id: id },
        include: { setores: true },
      });
      if (!buscar) {
        this.logger.warn(TYPES_NOTICES.NOT_FOUND);
        throw new NotFoundException(TYPES_NOTICES.NOT_FOUND);
      }

      this.logger.log(TYPES_NOTICES.FIND_ONE);
      return buscar;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - CREATE');
      throw error;
    }
  }

  async findLast(
    colaboradorId: string,
    setorId: string,
    status: boolean,
    tx?: Prisma.TransactionClient,
  ): Promise<CompetenciaSetorial> {
    try {
      const client = tx ?? this.prisma.client;

      const buscar = await client.competenciaSetorial.findFirst({
        where: {
          colaboradorId: colaboradorId,
          setorId: setorId,
          status: status,
        },
      });

      if (!buscar) {
        this.logger.warn(TYPES_NOTICES.NOT_FOUND);
      }

      return buscar;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - FINDLAST');
      throw error;
    }
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

  async deactiveAll(
    ids: Array<string>,
    tx?: Prisma.TransactionClient,
  ): Promise<Prisma.BatchPayload> {
    try {
      const client = tx ?? this.prisma.client;

      const inativar = await client.competenciaSetorial.updateMany({
        where: { id: { in: ids } },
        data: {
          status: false,
          _auditAction: Acao.DEACTIVATE,
        },
      });

      this.logger.log(TYPES_NOTICES.ACTIVE_MANY);
      return inativar;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - DEACTIVE-ALL');
      throw error;
    }
  }

  async remove(id: string): Promise<CompetenciaSetorial> {
    try {
      const deletarSetores = await this.prisma.client.$transaction(
        async (tx: any) => {
          const verificar = await this.findOne(id, tx);

          if (verificar.status) {
            this.logger.warn(TYPES_NOTICES.UNAUTHORIZED);
            throw new UnauthorizedException(TYPES_NOTICES.UNAUTHORIZED);
          }

          const deletar = await tx.competenciaSetorial.delete({
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

  // METODO DE CONSULTA DINAMICA
  private readonly allowedCompetenciaSetorialFiels = [
    'id',
    'colaboradorId',
    'gestorId',
    'setorId',
    'setor',
    'turno',
    'status',
  ];

  private async buildSelect(
    campos?: string,
  ): Promise<Record<string, true> | undefined> {
    if (!campos) return undefined;

    const campoArray = campos.split(',').map((c) => c.trim());
    const selecaoObj = {};

    for (const campo of campoArray) {
      if (this.allowedCompetenciaSetorialFiels.includes(campo)) {
        selecaoObj[campo] = true;
      }
    }

    return Object.keys(selecaoObj).length > 0 ? selecaoObj : undefined;
  }
}
