import { TenantContextService } from '@/auth/tenant-context/tenant-context.service';
import { PasswordPin } from '@/constants/password-pin.const';
import { Prisma } from '@/generated/prisma/client';
import { Acao } from '@/generated/prisma/enums';
import { PrismaService } from '@/prisma/prisma.service';
import { TYPES_NOTICES } from '@/utils/types-notices.cosnt';
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { ContadorCrachaService } from '../contador-cracha/contador-cracha.service';
import { UpdateContadorCrachaDto } from '../contador-cracha/dto/update-contador-cracha.dto';
import { GestorService } from '../gestor/gestor.service';
import {
  CreateUsuarioDto,
  CreateUsuarioMaster,
} from './dto/create-usuario.dto';
import {
  UpdateUsuarioDto,
  UpdateUsuarioPasswordDto,
} from './dto/update-usuario.dto';
import { Usuario, UsuarioListagem } from './entities/usuario.entity';
import {
  QueryBagdeEnterpriceDto,
  QueryUsuarioFilterDto,
} from './dto/query-usuario.dto';
import { Contador } from '@/interfaces/counter.interface';
import { CompetenciaSetorialOrquestradorService } from '@/services-orchestrator/competencia-setorial/competencia-setorial-orquestrador.service';
import { GestorOrquestradorService } from '@/services-orchestrator/gestor/gestor.service';

@Injectable()
export class UsuarioService {
  private logger = new Logger(UsuarioService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly contadorCracha: ContadorCrachaService,
    private readonly gestorOrq: GestorOrquestradorService,
    private readonly compSetOrq: CompetenciaSetorialOrquestradorService,
    private readonly tenantContext: TenantContextService,
  ) {}

  /* 
    CRIAR USUARIO MASTER: 
    - acesso ao usuario principal. 
    - ajustar essa criação para um formato de criação apartir da inicialização do sistema, para criar o registro.
    - usuario criado sem necessidade de autenticação.
  */
  async createMaster(create: CreateUsuarioMaster): Promise<Usuario> {
    try {
      const { senha, pin, ...dados } = create;

      const senhaHash = await this.generateHash(senha);
      const pinHash = await this.generateHash(pin);

      const criar = await this.prisma.usuario.create({
        data: {
          ...dados,
          senha: senhaHash,
          pin: pinHash,
        },
      });

      this.logger.log(TYPES_NOTICES.CREATE);
      return criar;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - CREATEMASTER');
      throw error;
    }
  }

  /*
  CRIAR USUARIO COM TODOS OS PERFIS DO SISTEMA: 
  - o mesmo é criado mediante empresa, contador de cracha e perfil criados.
  - create padrão de para todos os perfis
  */
  async create(create: CreateUsuarioDto): Promise<Usuario> {
    try {
      const criarUsuario = await this.prisma.client.$transaction(
        async (tx: any) => {
          const ctx = this.tenantContext.getStore()!;

          const senhaHash = await this.generateHash(PasswordPin.password);
          const pinHash = await this.generateHash(PasswordPin.pin);

          let dadosContador: UpdateContadorCrachaDto;

          if (create.empresaId) {
            dadosContador = { empresaId: create.empresaId ?? '' };
          } else {
            dadosContador = { empresaId: ctx.empresa ?? '' };
            create.empresaId = ctx.empresa;
          }

          this.logger.debug(dadosContador);

          const criarCracha = await this.contadorCracha.update(
            dadosContador,
            tx,
          );

          const criar = await tx.usuario.create({
            data: {
              ...create,
              cracha: criarCracha.contador,
              senha: senhaHash,
              pin: pinHash,
            },
          });

          await this.gestorOrq.create(criar.id, ctx.user, tx);

          return criar;
        },
      );

      this.logger.log(TYPES_NOTICES.CREATE);
      return criarUsuario;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - CREATEASSIST');
      throw error;
    }
  }

  // LISTA OS USUARIOS
  async findAll(
    query?: QueryUsuarioFilterDto,
    tx?: Prisma.TransactionClient,
  ): Promise<UsuarioListagem[]> {
    try {
      const ctx = this.tenantContext.getStore()!;

      const client = tx ?? this.prisma.client;

      const { campos, ...filtros } = query ?? {};

      const condicao: Prisma.UsuarioWhereInput = {};
      // Condição de registro não deve retornar
      condicao.AND = [
        { nome: { not: 'USUARIO MASTER' } },
        { id: { not: ctx?.user } },
      ];

      if (filtros.cracha) condicao.cracha = filtros.cracha;
      if (filtros.nome) condicao.nome = filtros.nome;
      if (filtros.dataAdmissao) condicao.dataAdmissao = filtros.dataAdmissao;
      if (filtros.dataNascimento)
        condicao.dataNascimento = filtros.dataNascimento;
      if (filtros.dataDesligamento)
        condicao.dataDesligamento = filtros.dataDesligamento;
      if (filtros.turno) condicao.turno = filtros.turno;
      if (filtros.escala) condicao.escala = filtros.escala;
      if (filtros.empresaId) condicao.empresaId = filtros.empresaId;
      if (filtros.perfilId) condicao.perfilId = filtros.perfilId;
      if (filtros.status) condicao.status = filtros.status;

      const selecao = await this.buildSelect(campos);

      const INCLUDES: Record<string, Prisma.UsuarioInclude> = {
        todos_relacoes: {
          perfil: true,
          empresa: true,
          gestorComoColaborador: { include: { gestor: true } },
        },
        todos_relacoes_parcial: {
          perfil: { select: { descricao: true, nivel: true } },
          empresa: { select: { razaoSocial: true } },
          gestorComoColaborador: {
            select: {
              id: true,
              gestor: { select: { nome: true, cracha: true } },
            },
          },
        },
        perfil: { perfil: true },
        empresa: { empresa: true },
        gestorComoColaborador: { gestorComoColaborador: true },
        perfil_parcial: {
          perfil: { select: { descricao: true, nivel: true } },
        },
        empresa_parcial: {
          empresa: { select: { razaoSocial: true } },
        },
        gestor_parcial: {
          gestorComoColaborador: {
            select: {
              id: true,
              gestor: { select: { nome: true, cracha: true } },
            },
          },
        },
      };

      const opcoes: Prisma.UsuarioFindManyArgs = {
        where: condicao,
        orderBy: { cracha: 'asc' },
      };

      if (campos?.length) {
        opcoes.select = selecao;
      } else {
        const incluir =
          filtros.incluir && INCLUDES[filtros.incluir]
            ? INCLUDES[filtros.incluir]
            : undefined;

        if (incluir) opcoes.include = incluir;
      }

      const listar: Usuario[] = await client.usuario.findMany(opcoes);

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

  /* FUNÇÃO CONTADOR DE REGISTROS SENDO O TOTAL, ATIVOS E INATIVOS */
  async counter(): Promise<Contador> {
    try {
      const grupos = await this.prisma.usuario.groupBy({
        by: ['status'],
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

  /* 
    BUSCA USUARIO PELO ID:
    - busca apenas pelo id.
    - retorna os dados completos com as chaves.
  */
  async findOne(
    id: string,
    tx?: Prisma.TransactionClient,
  ): Promise<UsuarioListagem> {
    try {
      const client = tx ?? this.prisma.client;

      const buscar = await client.usuario.findUnique({
        where: { id: id },
        include: {
          perfil: true,
          empresa: true,
          gestorComoColaborador: {
            include: { gestor: true },
          },
        },
      });

      if (!buscar) {
        this.logger.warn(TYPES_NOTICES.NOT_FOUND);
        throw new NotFoundException(TYPES_NOTICES.NOT_FOUND);
      }

      this.logger.log(TYPES_NOTICES.FIND_ONE);

      return buscar;
    } catch (error) {
      this.logger.error('Falha na busca do usuário.');
      throw error;
    }
  }

  /* 
    BUSCA USUARIO PELO CRACHA E EMPRESA:
    - busca apenas pelo cracha e empresa.
  */
  async findOneBadgeAndEnterprice(
    query: QueryBagdeEnterpriceDto,
    tx?: Prisma.TransactionClient,
  ): Promise<Usuario> {
    try {
      const client = tx ?? this.prisma.client;

      const condicao: Prisma.UsuarioWhereInput = {};
      condicao.cracha = query.cracha;
      condicao.empresaId = query.empresaId;

      const buscar = await client.usuario.findFirst({
        where: condicao,
      });

      if (!buscar) {
        this.logger.warn(TYPES_NOTICES.NOT_FOUND);
        throw new NotFoundException(TYPES_NOTICES.NOT_FOUND);
      }

      this.logger.log(TYPES_NOTICES.FIND_ONE);

      return buscar;
    } catch (error) {
      this.logger.error(
        TYPES_NOTICES.SERVICE_FAILURE,
        ' - findOneBadgeAndEnterprice',
      );
      throw error;
    }
  }

  /*
  ATUALIZA USUARIO PELO ID: 
  - atualiza todos os dados.
  - ajustar o mesmo de acordo com o perfil do usuario.
  - ao atualizar o turno se o usuario for gestor o mesmo inativa suas competencias.
  */
  async update(id: string, update: UpdateUsuarioDto): Promise<Usuario> {
    try {
      const atualizarUsuario = await this.prisma.client.$transaction(
        async (tx: any) => {
          const buscar = await this.findOne(id, tx);
          if (!buscar) {
            this.logger.warn(TYPES_NOTICES.NOT_FOUND);
            throw new NotFoundException(TYPES_NOTICES.NOT_FOUND);
          }

          if (update.turno !== buscar.turno) {
            await this.compSetOrq.deactiveAllCompSet(id, tx);
          }

          const atualizar = await tx.usuario.update({
            where: { id: id },
            data: update,
          });

          return atualizar;
        },
      );

      this.logger.log(TYPES_NOTICES.UPDATE);
      return atualizarUsuario;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE);
      throw error;
    }
  }

  /*
  ATUALIZA A SENHA E O PIN:
  - função de atualização atraves das credenciais do token.
  - operação feita apenas do usuario logado.
  */
  async updatePasswordPinUsuario(
    update: UpdateUsuarioPasswordDto,
    tipo: string,
  ): Promise<Usuario> {
    try {
      const atualizarUsuario = await this.prisma.client.$transaction(
        async (tx: any) => {
          const ctx = this.tenantContext.getStore()!;

          const buscar = await this.findOne(ctx.user, tx);

          if (!buscar) {
            this.logger.warn(TYPES_NOTICES.NOT_FOUND);
            throw new NotFoundException(TYPES_NOTICES.NOT_FOUND);
          }

          const { senha, pin } = buscar;
          let credencial: string;

          if (tipo === 'PAS') credencial = senha;
          else credencial = pin;

          const { atual, novo } = update;
          const validada = await this.compareHash(atual, credencial);

          if (!validada) {
            this.logger.warn(TYPES_NOTICES.INVALID_CREDENTIAL);
            throw new UnauthorizedException(TYPES_NOTICES.INVALID_CREDENTIAL);
          }

          const igual = await this.compareHash(novo, credencial);

          if (igual) {
            this.logger.log(TYPES_NOTICES.EQUALS_CREDENTIAL);
            throw new BadRequestException(TYPES_NOTICES.EQUALS_CREDENTIAL);
          }

          const novoHash = await this.generateHash(novo);
          const dado: { senha?: string; pin?: string } = {};
          if (tipo === 'PAS') dado.senha = novoHash;
          else dado.pin = novoHash;

          const atualizar = await tx.usuario.update({
            where: { id: ctx.user },
            data: { ...dado, versaoToken: buscar.versaoToken + 1 },
          });

          return atualizar;
        },
      );
      this.logger.log('Credencial atualizado com sucesso');
      return atualizarUsuario;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE);
      throw error;
    }
  }

  /*
  ATIVAR USUARIO:
  - ativa o usuario de forma de requisição.
  - ativa juntamente com o gestor.
  */
  async active(id: string): Promise<Usuario> {
    try {
      const ativarUsuario = await this.prisma.client.$transaction(
        async (tx: any) => {
          const ctx = this.tenantContext.getStore()!;

          const buscar = await this.findOne(id, tx);
          if (!buscar) {
            this.logger.warn(TYPES_NOTICES.NOT_FOUND);
            throw new NotFoundException(TYPES_NOTICES.NOT_FOUND);
          }

          const ativar = await tx.usuario.update({
            where: { id: id },
            data: {
              dataDesligamento: null,
              status: true,
              _auditAction: Acao.ACTIVE,
            },
          });

          await this.gestorOrq.active(ativar.id, ctx, tx);

          return ativar;
        },
      );

      this.logger.log(TYPES_NOTICES.ACTIVE);
      return ativarUsuario;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - active');
      throw error;
    }
  }

  /*
  INATIVAR USUARIO:
  - inativa o usuario de forma de requisição.
  - inativa juntamente com o gestor.
  */
  async deactive(id: string): Promise<Usuario> {
    try {
      const inativarUsuario = await this.prisma.client.$transaction(
        async (tx: any) => {
          const ctx = this.tenantContext.getStore()!;

          const buscar = await this.findOne(id, tx);
          if (!buscar) {
            this.logger.warn(TYPES_NOTICES.NOT_FOUND);
            throw new NotFoundException(TYPES_NOTICES.NOT_FOUND);
          }

          const inativar = await tx.usuario.update({
            where: { id: id },
            data: {
              dataDesligamento: new Date(),
              status: false,
              _auditAction: Acao.DEACTIVATE,
            },
          });

          await this.gestorOrq.deactive(inativar.id, ctx, tx);

          return inativar;
        },
      );

      this.logger.log(TYPES_NOTICES.DEACTIVE);
      return inativarUsuario;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - deactive');
      throw error;
    }
  }

  /* 
    ATIVA TODOS OS USUARIO ATRAVES DA INATIVAÇÃO DA EMPRESA:
    - serviço interno ativa todos os usuarios de uma empresa.
    - ação somente executada pela assistencia
  */
  async activeAll(
    ids: Array<string>,
    tx?: Prisma.TransactionClient,
  ): Promise<Prisma.BatchPayload> {
    try {
      const client = tx ?? this.prisma.client;

      const ativar = await client.usuario.updateMany({
        where: { id: { in: ids } },
        data: {
          dataDesligamento: null,
          status: true,
          _auditAction: Acao.ACTIVE,
        },
      });

      this.logger.log(TYPES_NOTICES.ACTIVE_MANY);
      return ativar;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - ACTIVEALL');
      throw error;
    }
  }

  /* 
    INATIVA TODOS OS USUARIO ATRAVES DA INATIVAÇÃO DA EMPRESA:
    - serviço interno inativa todos os usuarios de uma empresa.
    - ação somente executada pela assistencia
  */
  async deactiveAll(
    ids: Array<string>,
    tx?: Prisma.TransactionClient,
  ): Promise<Prisma.BatchPayload> {
    try {
      const client = tx ?? this.prisma.client;

      const inativar = await client.usuario.updateMany({
        where: { id: { in: ids } },
        data: {
          dataDesligamento: new Date(),
          status: false,
          _auditAction: Acao.DEACTIVATE,
        },
      });

      this.logger.log(TYPES_NOTICES.DEACTIVE_MANY);
      return inativar;
    } catch (error) {
      this.logger.error('Falha ao inativar o conjunto de usuários.');
      throw error;
    }
  }

  /* 
    DELETA O USUARIO TRAVES DO ID:
    - serviço autorizado apenas para gestores e administradores.
    - elimina os dados do gestor. 
  */
  async remove(id: string): Promise<Usuario> {
    try {
      const deletarUsuario = await this.prisma.client.$transaction(
        async (tx: any) => {
          const buscar = await this.findOne(id, tx);

          if (buscar.status === true) {
            this.logger.warn(TYPES_NOTICES.NOT_DEACTIVE);
            throw new UnauthorizedException(TYPES_NOTICES.NOT_DEACTIVE);
          }

          /*
          if (buscar.empresaId !== usuario.empresa) {
            this.logger.warn(TYPES_NOTICES.NOT_BELONG);
            throw new UnauthorizedException(TYPES_NOTICES.NOT_BELONG);
          }
          */

          await this.gestorOrq.remove(buscar.id, tx);

          const deletar = await tx.usuario.delete({
            where: { id: id },
          });

          return deletar;
        },
      );

      this.logger.log(TYPES_NOTICES.DELETE);
      return deletarUsuario;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - delete');
      throw error;
    }
  }

  /*
  DELETA TODOS USUARIOS MEDIANTE O DELETE DE UMA EMPRESA:
  - serviço interno.
  - remoção em lote atraves da remoção da empresa.
  -sem requisição http.
  */
  async removeAll(
    ids: Array<string>,
    tx?: Prisma.TransactionClient,
  ): Promise<Prisma.BatchPayload> {
    try {
      const client = tx ?? this.prisma.client;

      const remover = await client.usuario.deleteMany({
        where: { id: { in: ids } },
      });

      this.logger.log(TYPES_NOTICES.DELETE_MANY);
      return remover;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - removeAll');
      throw error;
    }
  }

  /* 
  FUNÇÃO AUTOINCRMENTAL DA VERSÃO DO TOKEN
  - finalidade de criar um controle de acesso sempre a cada novo acesso.
  - gera sempre um novo token a cada acesso.
  - o valor é incremental
  */
  async incrementarVersaoToken(id: string, versao: number) {
    try {
      await this.prisma.client.usuario.update({
        where: { id: id },
        data: { versaoToken: versao + 1 },
      });

      this.logger.log(TYPES_NOTICES.UPDATE_INCREMENT);
    } catch (error) {
      this.logger.error(
        TYPES_NOTICES.SERVICE_FAILURE,
        ' - IncrementerVersaoToken',
      );
      throw error;
    }
  }

  // METODO DE COMPARAÇÃO DE HASH
  async compareHash(novoHash: string, atualHash: string): Promise<boolean> {
    const vadidadorHash = await bcrypt.compare(novoHash, atualHash);
    return vadidadorHash;
  }

  // METODO PRIVADO DE CRIAÇÃO DE HASH
  private async generateHash(hash: string): Promise<string> {
    const novoHash = await bcrypt.hash(hash, 10);
    return novoHash;
  }

  // METODO DE CONSULTA DINAMICA
  private readonly allowedUsuarioFiels = [
    'id',
    'cracha',
    'nome',
    'dataNascimento',
    'dataAdmissao',
    'dataDesligamento',
    'perfilId',
    'turno',
    'escala',
    'empresaId',
    'status',
  ];

  private async buildSelect(
    campos?: string,
  ): Promise<Record<string, true> | undefined> {
    if (!campos) return undefined;

    const campoArray = campos.split(',').map((c) => c.trim());
    const selecaoObj = {};

    for (const campo of campoArray) {
      if (this.allowedUsuarioFiels.includes(campo)) {
        selecaoObj[campo] = true;
      }
    }

    return Object.keys(selecaoObj).length > 0 ? selecaoObj : undefined;
  }
}
