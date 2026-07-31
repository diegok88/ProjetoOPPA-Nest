import { Auth } from '@/auth/entities/auth.entity';
import { ROLES } from '@/auth/guards/roles.const';
import { PasswordPin } from '@/constants/password-pin.const';
import { Prisma } from '@/generated/prisma/client';
import { Acao } from '@/generated/prisma/enums';
import { PrismaService } from '@/prisma/prisma.service';
import { ExtractDataAuditoria } from '@/utils/extract-data-auditoria.util';
import { TYPES_NOTICES } from '@/utils/types-notices.cosnt';
import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { CreateAuditoriaDto } from '../auditoria/dto/create-auditoria.dto';
import { UpdateAuditoriaDto } from '../auditoria/dto/update-auditoria.dto';
import { ContadorCrachaService } from '../contador-cracha/contador-cracha.service';
import { UpdateContadorCrachaDto } from '../contador-cracha/dto/update-contador-cracha.dto';
import {
  CreateUsuarioAdmin,
  CreateUsuarioAssistDto,
  CreateUsuarioGestor,
  CreateUsuarioMaster,
} from './dto/create-usuario.dto';
import {
  QueryBagdeEnterpriceDto,
  QueryUsuarioDto,
} from './dto/query-usuario.dto';
import {
  UpdatePasswordPinDto,
  UpdateUsuarioDto,
} from './dto/update-usuario.dto';
import { Usuario, UsuarioMaster } from './entities/usuario.entity';
import { PerfilService } from '../perfil/perfil.service';
import { GestorService } from '../gestor/gestor.service';

@Injectable()
export class UsuarioService {
  private logger = new Logger(UsuarioService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly contadorCracha: ContadorCrachaService,
    @Inject(forwardRef(() => PerfilService))
    private readonly perfil: PerfilService,
    private readonly gestor: GestorService,
    private readonly auditoria: AuditoriaService,
  ) {}

  /* 
    CRIAR USUARIO MASTER: 
    - acesso ao usuario principal. 
    - ajustar essa criação para um formato de criação apartir da inicialização
    do sistema, para criar o registro.
  */
  async createMaster(create: CreateUsuarioMaster): Promise<UsuarioMaster> {
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
  - perfil de usuario da empresa de gestão do sistema.
  */
  async createAssist(
    autenticado: Auth,
    create: CreateUsuarioAssistDto,
  ): Promise<Usuario> {
    try {
      const criarUsuario = await this.prisma.$transaction(async (tx) => {
        const senhaHash = await this.generateHash(PasswordPin.password);
        const pinHash = await this.generateHash(PasswordPin.pin);

        const dadosContador: UpdateContadorCrachaDto = {
          empresaId: autenticado.empresa,
          registradoPorId: autenticado.userId,
        };
        const criarCracha = await this.contadorCracha.update(dadosContador);

        const criar = await tx.usuario.create({
          data: {
            ...create,
            cracha: criarCracha.contador,
            senha: senhaHash,
            pin: pinHash,
          },
        });

        await this.gestor.create(criar.id, autenticado);

        const dados = ExtractDataAuditoria(criar);

        const dadosAuditoria: CreateAuditoriaDto = {
          entidade: 'USUARIO',
          registroId: criar.id,
          acao: Acao.CREATE,
          dadosRegistrados: dados,
          empresaId: autenticado.empresa,
          registradoPorId: autenticado.userId,
        };

        await this.auditoria.create(dadosAuditoria, tx);

        return criar;
      });

      this.logger.log(TYPES_NOTICES.CREATE);
      return criarUsuario;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - CREATEASSIST');
      throw error;
    }
  }

  /*
    CRIAR USUARIO COMO ADMINISTRADOR: 
    - usuario de criação interna da empresa que usufrui do sistema.
    - permitido criar usuario administradores, gestores e operacional.
  */
  async createAdmin(
    autenticado: Auth,
    create: CreateUsuarioAdmin,
  ): Promise<Usuario> {
    try {
      const criarUsuario = await this.prisma.$transaction(async (tx) => {
        const senhaHash = await this.generateHash(PasswordPin.password);
        const pinHash = await this.generateHash(PasswordPin.pin);

        const dadosContador: UpdateContadorCrachaDto = {
          empresaId: autenticado.empresa,
          registradoPorId: autenticado.userId,
        };
        const criarCracha = await this.contadorCracha.update(dadosContador);

        const criar = await tx.usuario.create({
          data: {
            ...create,
            cracha: criarCracha.contador,
            senha: senhaHash,
            pin: pinHash,
          },
        });

        const dados = await ExtractDataAuditoria(criar);

        const dadosAuditoria: CreateAuditoriaDto = {
          entidade: 'USUARIO',
          registroId: criar.id,
          acao: Acao.CREATE,
          dadosRegistrados: dados,
          empresaId: autenticado.empresa,
          registradoPorId: autenticado.userId,
        };

        await this.auditoria.create(dadosAuditoria);

        return criar;
      });
      this.logger.log(TYPES_NOTICES.CREATE);
      return criarUsuario;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - CREATEADMIN');
      throw error;
    }
  }

  /*
    CRIAR USUARIO COMO GESTOR: 
    - o autorizado apenas para o perfil de supervisor.
    - apenas criar usuarios operacionais.
  */
  async createGestor(
    autenticado: Auth,
    create: CreateUsuarioGestor,
  ): Promise<Usuario> {
    try {
      const criarUsuario = await this.prisma.$transaction(async (tx) => {
        const senhaHash = await this.generateHash(PasswordPin.password);
        const pinHash = await this.generateHash(PasswordPin.pin);

        const dadosContador: UpdateContadorCrachaDto = {
          empresaId: autenticado.empresa,
          registradoPorId: autenticado.userId,
        };
        const criarCracha = await this.contadorCracha.update(dadosContador);

        const perfil = await this.perfil.findDescription(ROLES.OPN1);

        const criar = await tx.usuario.create({
          data: {
            ...create,
            cracha: criarCracha.contador,
            senha: senhaHash,
            pin: pinHash,
            perfilId: perfil.id,
            empresaId: autenticado.empresa,
          },
        });

        const dados = ExtractDataAuditoria(criar);

        const dadosAuditoria: CreateAuditoriaDto = {
          entidade: 'USUARIO',
          registroId: criar.id,
          acao: Acao.CREATE,
          dadosRegistrados: dados,
          empresaId: autenticado.empresa,
          registradoPorId: autenticado.userId,
        };

        await this.auditoria.create(dadosAuditoria, tx);

        return criar;
      });

      this.logger.log(TYPES_NOTICES.CREATE);
      return criarUsuario;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - CREATEGESTOR');
      throw error;
    }
  }

  // LISTA OS USUARIOS
  async findAll(
    query: QueryUsuarioDto,
    tx?: Prisma.TransactionClient,
  ): Promise<Usuario[]> {
    try {
      const client = tx ?? this.prisma;

      const { campos, ...filtros } = query;

      const condicao: Prisma.UsuarioWhereInput = {};

      if (filtros.cracha) condicao.cracha = filtros.cracha;
      if (filtros.nome)
        condicao.nome = { contains: filtros.nome, mode: 'insensitive' };
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

      const listarUsuarios = await client.usuario.findMany({
        where: condicao,
        select: selecao,
      });

      this.logger.log(TYPES_NOTICES.FIND_ALL);

      return listarUsuarios;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - FINDALL');
      throw error;
    }
  }

  /* 
    BUSCA USUARIO PELO ID:
    - busca apenas pelo id.
  */
  async findOne(id: string, tx?: Prisma.TransactionClient): Promise<Usuario> {
    try {
      const client = tx ?? this.prisma;

      const buscar = await client.usuario.findUnique({
        where: { id: id },
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
      const client = tx ?? this.prisma;

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

  // ATUALIZA USUARIO PELO ID - atualiza todos os dados
  async update(
    id: string,
    autenticado: Auth,
    update: UpdateUsuarioDto,
  ): Promise<Usuario> {
    try {
      const atualizarUsuario = await this.prisma.$transaction(async (tx) => {
        const buscar = await this.findOne(id, tx);
        if (!buscar) {
          this.logger.warn(TYPES_NOTICES.NOT_FOUND);
          throw new NotFoundException(TYPES_NOTICES.NOT_FOUND);
        }

        const antes = ExtractDataAuditoria(buscar);

        const atualizar = await tx.usuario.update({
          where: { id: id },
          data: update,
        });

        const depois = ExtractDataAuditoria(atualizar);

        const dadosAuditoria: UpdateAuditoriaDto = {
          entidade: 'USUARIO',
          registroId: atualizar.id,
          acao: 'UPDATE',
          antes: antes,
          depois: depois,
          empresaId: autenticado.empresa,
          registradoPorId: autenticado.userId,
        };
        await this.auditoria.update(dadosAuditoria);

        return atualizar;
      });

      this.logger.log(TYPES_NOTICES.UPDATE);
      return atualizarUsuario;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE);
      throw error;
    }
  }

  async updatePasswordPinUsuario(
    autenticado: Auth,
    update: UpdatePasswordPinDto,
    tipo: string,
  ): Promise<Usuario> {
    try {
      const atualizarUsuario = await this.prisma.$transaction(async (tx) => {
        const buscar = await this.findOne(autenticado.userId, tx);

        const antes = ExtractDataAuditoria(buscar);

        if (!buscar) {
          this.logger.warn(TYPES_NOTICES.NOT_FOUND);
          throw new NotFoundException(TYPES_NOTICES.NOT_FOUND);
        }

        const { senha, pin } = buscar;
        let credencial: string;

        if (tipo === 'PAS') credencial = senha;
        else credencial = pin;

        const { atual, nova } = update;
        const validada = await this.compareHash(atual, credencial);

        if (!validada) {
          this.logger.log(TYPES_NOTICES.INVALID_CREDENTIAL);
          throw new UnauthorizedException(TYPES_NOTICES.INVALID_CREDENTIAL);
        }

        const igual = await this.compareHash(nova, credencial);

        if (igual) {
          this.logger.log(TYPES_NOTICES.EQUALS_CREDENTIAL);
          throw new BadRequestException(TYPES_NOTICES.EQUALS_CREDENTIAL);
        }

        const novoHash = await this.generateHash(nova);
        const dado: { senha?: string; pin?: string } = {};
        if (tipo === 'PAS') dado.senha = novoHash;
        else dado.pin = novoHash;

        const atualizar = await tx.usuario.update({
          where: { id: autenticado.userId },
          data: dado,
        });

        const depois = ExtractDataAuditoria(atualizar);

        const dadosAuditoria: UpdateAuditoriaDto = {
          entidade: 'USUARIO',
          registroId: atualizar.id,
          acao: Acao.UPDATE,
          antes: antes,
          depois: depois,
          empresaId: autenticado.empresa,
          registradoPorId: autenticado.userId,
        };

        await this.auditoria.update(dadosAuditoria, tx);

        return atualizar;
      });
      return atualizarUsuario;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE);
      throw error;
    }
  }

  // INATIVAR USUARIO
  async deactive(id: string, autenticado: Auth): Promise<Usuario> {
    try {
      const inativarUsuario = await this.prisma.$transaction(async (tx) => {
        const buscar = await this.findOne(id, tx);
        if (!buscar) {
          this.logger.warn(TYPES_NOTICES.NOT_FOUND);
          throw new NotFoundException(TYPES_NOTICES.NOT_FOUND);
        }

        const antes = ExtractDataAuditoria(buscar);

        const inativar = await tx.usuario.update({
          where: { id: id },
          data: {
            dataDesligamento: new Date(),
            status: false,
          },
        });
        const depois = ExtractDataAuditoria(inativar);

        const dados: UpdateAuditoriaDto = {
          entidade: 'USUARIO',
          registroId: id,
          acao: Acao.UPDATE,
          antes: antes,
          depois: depois,
          empresaId: autenticado.empresa,
          registradoPorId: autenticado.userId,
        };

        await this.auditoria.update(dados, tx);

        return inativar;
      });

      this.logger.log(TYPES_NOTICES.DEACTIVE);
      return inativarUsuario;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - deactive');
      throw error;
    }
  }

  /* 
    INATIVA TODOS OS USUARIO ATRAVES DA INATIVAÇÃO DA EMPRESA:
    - serviço interno elimina todos os usuarios de uma empresa.
    - ação somente executada pela assistencia
  */
  async deactiveAll(
    empresaId: string,
    autenticado: Auth,
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    try {
      const executar = async (
        client: Prisma.TransactionClient | PrismaService,
      ) => {
        const listar = await client.usuario.findMany({
          where: { empresaId: empresaId },
        });

        if (listar.length === 0) {
          this.logger.warn(TYPES_NOTICES.EMPTY_LIST);
          return;
        }

        const antes = listar.map((usuario) => ExtractDataAuditoria(usuario));

        const ids = listar.map((usuario) => usuario.id);

        await client.usuario.updateMany({
          where: { id: { in: ids } },
          data: {
            dataDesligamento: new Date(),
            status: false,
          },
        });

        const listarAtualizados = await client.usuario.findMany({
          where: { empresaId: empresaId },
        });

        const depois = listarAtualizados.map((usuario) =>
          ExtractDataAuditoria(usuario),
        );

        const listarAuditorias: UpdateAuditoriaDto[] = listar.map(
          (usuario, index) => ({
            entidade: 'USUARIO',
            registroId: usuario.id,
            acao: Acao.UPDATE,
            antes: antes[index],
            depois: depois[index],
            empresaId: autenticado.empresa,
            registradoPorId: autenticado.userId,
          }),
        );

        await this.auditoria.updateAll(listarAuditorias, client);
      };

      let inativarUsuario: any;
      if (tx) {
        inativarUsuario = await executar(tx);
      } else {
        inativarUsuario = await this.prisma.$transaction(async (novatx) => {
          return executar(novatx);
        });
      }

      this.logger.log(TYPES_NOTICES);
    } catch (error) {
      this.logger.error('Falha ao inativar o conjunto de usuários.');
      throw error;
    }
  }

  /* 
    DELETA O USUARIO TRAVES DO ID:
    - serviço autorizado apenas para gestores e administradores 
  */
  async remove(id: string, autenticado: Auth): Promise<Usuario> {
    try {
      const deletarUsuario = await this.prisma.$transaction(async (tx) => {
        const buscar = await this.findOne(id, tx);
        if (buscar.status === true) {
          this.logger.warn(TYPES_NOTICES.NOT_DEACTIVE);
          throw new UnauthorizedException(TYPES_NOTICES.NOT_DEACTIVE);
        }
        if (buscar.empresaId !== autenticado.empresa) {
          this.logger.warn(TYPES_NOTICES.NOT_BELONG);
          throw new UnauthorizedException(TYPES_NOTICES.NOT_BELONG);
        }
        const deletar = await this.prisma.usuario.delete({
          where: { id: id },
        });

        const dados = ExtractDataAuditoria(deletar);

        const dadosAuditoria: CreateAuditoriaDto = {
          entidade: 'USUARIO',
          registroId: id,
          acao: Acao.DELETE,
          dadosRegistrados: dados,
          empresaId: autenticado.empresa,
          registradoPorId: autenticado.userId,
        };

        await this.auditoria.create(dadosAuditoria, tx);
        return deletar;
      });

      this.logger.log(TYPES_NOTICES.DELETE);
      return deletarUsuario;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - delete');
      throw error;
    }
  }

  // DELETA TODOS USUARIOS MEDIANTE O DELETE DE UMA EMPRESA
  async removeAll(
    empresaId: string,
    autenticado: Auth,
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    try {
      const executar = async (
        client: Prisma.TransactionClient | PrismaService,
      ) => {
        const listar = await client.usuario.findMany({
          where: { empresaId: empresaId },
        });

        if (listar.length === 0) {
          this.logger.warn(TYPES_NOTICES.EMPTY_LIST);
          return;
        }

        const ids = listar.map((usuario) => usuario.id);

        await client.usuario.deleteMany({
          where: { id: { in: ids } },
        });

        const dados = listar.map((usuario) => {
          ExtractDataAuditoria(usuario);
        });

        const dadosAuditoria: CreateAuditoriaDto[] = listar.map(
          (usuario, index) => ({
            entidade: 'USUARIO',
            registroId: usuario.id,
            acao: Acao.DELETE,
            dadosRegistrados: dados[index],
            empresaId: autenticado.empresa,
            registradoPorId: autenticado.userId,
          }),
        );

        await this.auditoria.createAll(dadosAuditoria, client);
      };

      let removerUsuarios: any;
      if (tx) {
        removerUsuarios = await executar(tx);
      } else {
        removerUsuarios = await this.prisma.$transaction(async (novatx) => {
          return executar(novatx);
        });
      }

      this.logger.log(TYPES_NOTICES.DELETE_MANY);
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - removeAll');
      throw error;
    }
  }

  // METODO DE COMPARAÇÃO DE HASH
  async compareHash(atualHash: string, novoHash: string): Promise<boolean> {
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
