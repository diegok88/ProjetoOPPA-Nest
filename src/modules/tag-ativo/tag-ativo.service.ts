import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateTagAtivoDto } from './dto/create-tag-ativo.dto';
import { UpdateTagAtivoDto } from './dto/update-tag-ativo.dto';
import { PrismaService } from '@/prisma/prisma.service';
import {
  TagAtivo,
  TagAtivoListagem,
  TagAtivoRelacoes,
} from './entities/tag-ativo.entity';
import { TYPES_NOTICES } from '@/utils/types-notices.cosnt';
import { Acao, Prisma, Usuario } from '@/generated/prisma/client';
import {
  QueryTagAtivoFilterDto,
  QueryTagAtivoSetoresDto,
} from './dto/query-tag-ativo.dto';
import { Contador } from '@/interfaces/counter.interface';
import { TenantContextService } from '@/auth/tenant-context/tenant-context.service';
import { AtivoService } from '../ativo/ativo.service';
import { CreateUsuarioTagAtivoDto } from '../usuario/dto/create-usuario.dto';
import { UsuarioService } from '../usuario/usuario.service';
import { PerfilService } from '../perfil/perfil.service';
import { PaginatedResponse } from '@/interfaces/paginator.interface';

@Injectable()
export class TagAtivoService {
  private logger = new Logger(TagAtivoService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly ativoService: AtivoService,
    private readonly usuarioService: UsuarioService,
    private readonly perfilService: PerfilService,
    private readonly tenantContext: TenantContextService,
  ) {}

  private obterContexto() {
    const ctx = this.tenantContext.getStore();
    if (!ctx?.user) {
      throw new UnauthorizedException('Contexto de usuário ausente.');
    }
    return ctx;
  }

  async create(create: CreateTagAtivoDto): Promise<TagAtivo> {
    try {
      const criarTag = await this.prisma.client.$transaction(
        async (tx: any) => {
          const ativo = await this.ativoService.findOne(create.ativoId, tx);

          const codTag = await tx.tagAtivo.count({
            where: { ativoId: create.ativoId },
          });

          const desTag: string = `${ativo.descricao.slice(0, 2)}${ativo.codigo}${codTag + 1}`;
          const nomeTag: string = `${ativo.descricao} - ${ativo.modelo}`;

          const criarTag = await tx.tagAtivo.create({
            data: { ...create, descricao: desTag },
          });

          const perfilTerm = await this.perfilService.findOneProfile(
            'TERMINAL',
            'NIVEL 1',
            true,
            tx,
          );

          const usuarioTagTerm: CreateUsuarioTagAtivoDto = {
            nome: nomeTag,
            codigo: `${criarTag.descricao}T`,
            tagAtivoId: criarTag.id,
            perfilId: perfilTerm.id,
          };

          await this.usuarioService.createTagAtivo(usuarioTagTerm, tx);

          const perfilDisp = await this.perfilService.findOneProfile(
            'DISPOSITIVO',
            'NIVEL 1',
            true,
            tx,
          );

          const usuarioTagDisp: CreateUsuarioTagAtivoDto = {
            nome: nomeTag,
            codigo: `${criarTag.descricao}D`,
            tagAtivoId: criarTag.id,
            perfilId: perfilDisp.id,
          };

          await this.usuarioService.createTagAtivo(usuarioTagDisp, tx);

          return criarTag;
        },
      );
      this.logger.log(TYPES_NOTICES.CREATE);
      return criarTag;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - CREATE');
      throw error;
    }
  }

  // METODO DE CONSULTA DINAMICA
  private readonly allowedTagAtivoFiels = [
    'id',
    'codigo',
    'descricao',
    'ativoId',
    'senha',
    'status',
  ];

  private async buildSelect(
    campos?: string,
  ): Promise<Record<string, true> | undefined> {
    if (!campos) return undefined;

    const campoArray = campos.split(',').map((c) => c.trim());
    const selecaoObj = {};

    for (const campo of campoArray) {
      if (this.allowedTagAtivoFiels.includes(campo)) {
        selecaoObj[campo] = true;
      }
    }

    return Object.keys(selecaoObj).length > 0 ? selecaoObj : undefined;
  }
  /* FUNÇÃO MONTAGEM DE CONDIÇÃO */
  private async toAssembleCondicao(
    filtros: Omit<
      QueryTagAtivoFilterDto,
      'page' | 'size' | 'campos' | 'incluir' | 'ordenacao'
    >,
    usuarioId?: string,
  ): Promise<Prisma.TagAtivoWhereInput> {
    const condicao: Prisma.TagAtivoWhereInput = {};

    if (filtros.descricao) condicao.descricao = filtros.descricao;
    if (filtros.ativoId) condicao.ativoId = filtros.ativoId;
    if (filtros.empresaId) condicao.ativo = { empresaId: filtros.empresaId };
    if (filtros.status !== undefined) condicao.status = filtros.status;

    return condicao;
  }
  /* FUNÇÃO MONTAGEM DE ORDENAÇÃO */
  private async toAssembleOrderBy(
    ordenacao?: string,
  ): Promise<Prisma.TagAtivoOrderByWithRelationInput[]> {
    switch (ordenacao) {
      case 'filtrar':
        return [{ codigo: 'desc' }, { status: 'asc' }];
      default:
        return [{ descricao: 'asc' }];
    }
  }
  /* FUNÇÃO MONTAGEM DE INCLUDE */
  private async toAssembleInclude(
    incluir?: string,
  ): Promise<Prisma.TagAtivoInclude> {
    switch (incluir) {
      case 'todos_relacoes':
        return { ativo: true, alocacaoTagAtivo: true };
      case 'alocacaoTagAtivo':
        return { alocacaoTagAtivo: true };
      default:
        return { ativo: true };
    }
  }
  async findAll(
    query: QueryTagAtivoFilterDto,
    tx?: Prisma.TransactionClient,
  ): Promise<PaginatedResponse<TagAtivoListagem>> {
    try {
      const client = tx ?? this.prisma.client;
      this.logger.debug(query);
      const {
        page = 1,
        size = 10,
        campos,
        incluir,
        decisao,
        ordenacao,
        ...filtros
      } = query;

      const condicao = await this.toAssembleCondicao(filtros);

      const selecao = await this.buildSelect(campos);

      let opcoes: Prisma.TagAtivoFindManyArgs = {};
      if (query.decisao === 'listar') {
        opcoes = {
          where: condicao,
          orderBy: await this.toAssembleOrderBy(ordenacao),
        };
      } else if (query.decisao === 'paginar') {
        opcoes = {
          where: condicao,
          orderBy: await this.toAssembleOrderBy(ordenacao),
          skip: (page - 1) * size,
          take: size,
        };
      }

      if (campos?.length) {
        opcoes.select = selecao;
      } else {
        opcoes.include = await this.toAssembleInclude(incluir);
      }

      const listar: TagAtivoRelacoes[] = await client.tagAtivo.findMany(opcoes);
      const total = await client.tagAtivo.count({ where: condicao });

      if (listar.length === 0) {
        this.logger.warn(TYPES_NOTICES.EMPTY_LIST);
      }

      return {
        dados: listar,
        total,
        pagina: page,
        tamanho: size,
      };
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - FINDALL');
      throw error;
    }
  }

  async findAllSection(
    query: QueryTagAtivoSetoresDto,
    tx?: Prisma.TransactionClient,
  ): Promise<TagAtivoRelacoes[]> {
    try {
      const client = tx ?? this.prisma.client;

      const opcao: Prisma.TagAtivoFindManyArgs = {
        where: { ativo: { setorId: query.setorId } },
        include: { ativo: true },
      };

      const listar = await client.tagAtivo.findMany(opcao);

      return listar;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - findAllSection( )');
      throw error;
    }
  }

  /* FUNÇÃO CONTADOR DE REGISTROS: TOTAL, ATIVOS E INATIVOS EM UMA ÚNICA QUERY */
  async counter(): Promise<Contador> {
    try {
      const ctx = this.tenantContext.getStore()?.empresa;

      const grupos = await this.prisma.tagAtivo.groupBy({
        by: ['status'],
        where: { ativo: { empresaId: ctx } },
        _count: { _all: true },
      });

      const ativos = grupos.find((g) => g.status === true)?._count._all ?? 0;
      const inativos = grupos.find((g) => g.status === false)?._count._all ?? 0;

      this.logger.log(TYPES_NOTICES.COUNTER);
      return { total: ativos + inativos, ativos, inativos };
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - COUNTER');
      throw error;
    }
  }

  async findOne(id: string, tx?: Prisma.TransactionClient): Promise<TagAtivo> {
    try {
      const client = tx ?? this.prisma.client;
      const buscar = await client.tagAtivo.findUnique({
        where: { id: id },
        include: { ativo: true },
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
  /* FUNÇÃO DE BUSCA COM RETORNO UNICO DADOS COM PARAMETROS DIFERENTES DO ID */
  async findOneQuery(
    query: QueryTagAtivoFilterDto,
    tx?: Prisma.TransactionClient,
  ): Promise<TagAtivo> {
    try {
      const client = tx ?? this.prisma.client;
      const { descricao, status } = query ?? {};
      const condicao: Prisma.TagAtivoWhereInput = {};
      if (descricao) condicao.descricao = descricao;
      if (status !== undefined) condicao.status = status;
      const buscar = await client.tagAtivo.findFirst({ where: condicao });
      return buscar;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - findOneId()');
      throw error;
    }
  }

  async update(
    id: string,
    updateTagAtivoDto: UpdateTagAtivoDto,
  ): Promise<TagAtivo> {
    try {
      const atualizarTag = await this.prisma.client.$transaction(
        async (tx: any) => {
          await this.findOne(id, tx);

          const atualizar = await tx.tagAtivo.update({
            where: { id: id },
            data: updateTagAtivoDto,
          });

          return atualizar;
        },
      );

      this.logger.log(TYPES_NOTICES.UPDATE);
      return atualizarTag;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - UPDATE');
      throw error;
    }
  }

  async active(id: string): Promise<TagAtivo> {
    try {
      const ativarTag = await this.prisma.client.$transaction(
        async (tx: any) => {
          const verificar = await this.findOne(id, tx);

          if (verificar.status) {
            this.logger.warn(TYPES_NOTICES.IS_ACTIVE);
            throw new UnauthorizedException(TYPES_NOTICES.IS_ACTIVE);
          }

          const ativar = await tx.tagAtivo.update({
            where: { id: id },
            data: { status: true, _auditAction: Acao.ACTIVE },
          });

          return ativar;
        },
      );

      this.logger.log(TYPES_NOTICES.ACTIVE);
      return ativarTag;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - DEACTIVE');
      throw error;
    }
  }

  async deactive(id: string): Promise<TagAtivo> {
    try {
      const inativarTag = await this.prisma.client.$transaction(
        async (tx: any) => {
          const verificar = await this.findOne(id, tx);

          if (!verificar.status) {
            this.logger.warn(TYPES_NOTICES.IS_DEACTIVE);
            throw new UnauthorizedException(TYPES_NOTICES.IS_DEACTIVE);
          }

          const inativar = await tx.tagAtivo.update({
            where: { id: id },
            data: { status: false, _auditAction: Acao.DEACTIVATE },
          });

          return inativar;
        },
      );

      this.logger.log(TYPES_NOTICES.DEACTIVE);
      return inativarTag;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - DEACTIVE');
      throw error;
    }
  }

  async remove(id: string): Promise<TagAtivo> {
    try {
      const removerTag = await this.prisma.client.$transaction(
        async (tx: any) => {
          const verificar = await this.findOne(id, tx);

          if (verificar.status) {
            this.logger.warn(TYPES_NOTICES.UNAUTHORIZED);
            throw new UnauthorizedException(TYPES_NOTICES.UNAUTHORIZED);
          }

          const remover = await tx.tagAtivo.delete({
            where: { id: id },
          });

          return remover;
        },
      );

      this.logger.log(TYPES_NOTICES.DELETE);
      return removerTag;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - REMOVE');
      throw error;
    }
  }
}
