import { Auth } from '@/auth/entities/auth.entity';
import { PasswordPin } from '@/constants/password-pin.const';
import { Prisma } from '@/generated/prisma/client';
import { Acao } from '@/generated/prisma/enums';
import { PrismaService } from '@/prisma/prisma.service';
import { ExtractDataAuditoria } from '@/utils/extract-data-auditoria.util';
import { TYPES_NOTICES } from '@/utils/types-notices.cosnt';
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { plainToClass } from 'class-transformer';
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
import { DeleteUsuarioDto } from './dto/delete-usuario.dto';
import {
  QueryBagdeEnterpriceDto,
  QueryUsuarioDto,
} from './dto/query-usuario.dto';
import { ResponseActiveUsuario } from './dto/response-active-usuario.dto';
import { ResponseUsuarioDto } from './dto/response-usuario.dto';
import { UpdateDataUsuarioDto } from './dto/update-data-usuario.dto';
import { UpdatePasswordUsuarioDto } from './dto/update-password-usuario.dto';
import { UpdatePinUsuarioDto } from './dto/update-pin-usuario.dto';
import {
  UpdateUsuarioDeactiveDto,
  UpdateUsuarioDto,
} from './dto/update-usuario.dto';
import { Usuario, UsuarioMaster } from './entities/usuario.entity';
import { ROLES } from '@/auth/guards/roles.const';
import { PerfilService } from '../perfil/perfil.service';

@Injectable()
export class UsuarioService {
  private logger = new Logger(UsuarioService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly contadorCracha: ContadorCrachaService,
    private readonly perfil: PerfilService,
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
      this.logger.error(TYPES_NOTICES.UPDATE);
      throw error;
    }
  }

  // ATUALIZAR DADOS DO USUARIO - menos senha e pin
  async updateDataUsuario(
    id: string,
    updateDataUsuarioDto: UpdateDataUsuarioDto,
  ): Promise<ResponseUsuarioDto> {
    try {
      const atualizarUsuario = await this.prisma.$transaction(async (tx) => {
        const buscar = await this.findOne(id);

        if (!buscar) {
          this.logger.warn(`Usuário id ${id} não encontrado.`);
          throw new NotFoundException();
        }
        const atualizar = await tx.usuario.update({
          where: { id: id },
          data: updateDataUsuarioDto,
        });
      });
      this.logger.log(`Usuário id ${id} atualizado com sucesso.`);
      return plainToClass(ResponseUsuarioDto, atualizarUsuario);
    } catch (error) {
      this.logger.error('Falha na atualização do usuário.');
      throw error;
    }
  }

  // ATUALIZAR SENHA
  async updatePasswordUsuario(
    id: string,
    updatePassword: UpdatePasswordUsuarioDto,
  ): Promise<ResponseUsuarioDto> {
    try {
      const buscaUsuario = await this.findOne(id);

      if (!buscaUsuario) {
        this.logger.warn(`Usuário id ${id} não encontrado`);
        throw new NotFoundException(`Usuário id ${id} não encontrado`);
      }
      const { atualSenha, novaSenha } = updatePassword;

      const senhaValidada = await this.compareHash(
        atualSenha,
        buscaUsuario.senha,
      );

      if (!senhaValidada) {
        this.logger.warn(`Senha do usuário id ${id} é inválida.`);
        throw new UnauthorizedException();
      }

      const senhaIgual = await this.compareHash(novaSenha, buscaUsuario.senha);

      if (senhaIgual) {
        this.logger.warn(
          `Senha atual do usuário id ${id} é igual a nova senha.`,
        );
        throw new BadRequestException();
      }

      const novoHash = await this.generateHash(novaSenha);

      const atualizarSenha = this.prisma.usuario.update({
        where: { id: id },
        data: { senha: novoHash },
      });
      this.logger.log(`Senha do usuário id ${id} realizada com sucesso`);
      return plainToClass(ResponseUsuarioDto, atualizarSenha);
    } catch (error) {
      this.logger.error('Falha ao atualizar a nova senha.');
      throw error;
    }
  }

  // ATUALIZAR PIN
  async updatePinUsuario(id: string, updatePin: UpdatePinUsuarioDto) {
    try {
      const buscaUsuario = await this.findOne(id);

      if (!buscaUsuario) {
        this.logger.warn(`Usuário id ${id} não encontrado`);
        throw new NotFoundException(`Usuário id ${id} não encontrado`);
      }
      const { atualPin, novoPin } = updatePin;

      const pinValidada = await this.compareHash(atualPin, buscaUsuario.pin);

      if (!pinValidada) {
        this.logger.warn(`Pin do usuário id ${id} é inválida.`);
        throw new UnauthorizedException();
      }

      const pinIgual = await this.compareHash(novoPin, buscaUsuario.pin);

      if (pinIgual) {
        this.logger.warn(`Pin atual do usuário id ${id} é igual a novo pin.`);
        throw new BadRequestException();
      }

      const novoHash = await this.generateHash(novoPin);

      const atualizarPin = this.prisma.usuario.update({
        where: { id: id },
        data: { pin: novoHash },
      });
      this.logger.log(`Pin do usuário id ${id} realizada com sucesso`);
      return plainToClass(ResponseUsuarioDto, atualizarPin);
    } catch (error) {
      this.logger.error('Falha ao atualizar a nova senha.');
      throw error;
    }
  }

  // INATIVAR USUARIO
  async deactive(
    id: string,
    updateEmpresaDeactiveDto: UpdateUsuarioDeactiveDto,
  ): Promise<ResponseUsuarioDto> {
    try {
      const inativarUsuario = await this.prisma.$transaction(async (tx) => {
        const { registradoPorId, empresaId } = updateEmpresaDeactiveDto;
        const buscar = await this.findOne(id, tx);
        if (!buscar) {
          this.logger.warn(`Usuário id ${id} não encontrado.`);
          throw new NotFoundException();
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
          empresaId: empresaId,
          registradoPorId: registradoPorId,
        };

        await this.auditoria.update(dados, tx);

        return inativar;
      });

      this.logger.log(`Usuário id ${id} inativado com sucesso.`);
      return plainToClass(ResponseUsuarioDto, inativarUsuario);
    } catch (error) {
      this.logger.error('Falha ao inativar usuário.');
      throw error;
    }
  }

  // INATIVA TODOS OS USUARIO ATRAVES DA INATIVAÇÃO DA EMPRESA
  async deactiveAll(
    updateUsuarioDeactiveDto: UpdateUsuarioDeactiveDto,
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    try {
      const executar = async (
        client: Prisma.TransactionClient | PrismaService,
      ) => {
        const { empresaId, registradoPorId } = updateUsuarioDeactiveDto;

        const listar = await client.usuario.findMany({
          where: { empresaId: empresaId },
        });

        if (listar.length === 0) {
          this.logger.warn(
            `Nenhum usuário encontrado para a empresa ${empresaId}`,
          );
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
            empresaId: empresaId,
            registradoPorId: registradoPorId,
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

      this.logger.log(
        `Todos usuários cadastrados na empresa id ${updateUsuarioDeactiveDto.empresaId} foram inativados com sucesso.`,
      );
    } catch (error) {
      this.logger.error('Falha ao inativar o conjunto de usuários.');
      throw error;
    }
  }

  // DELETA O USUARIO
  async remove(
    id: string,
    deleteUsuarioDto: DeleteUsuarioDto,
  ): Promise<ResponseUsuarioDto> {
    try {
      const deletarUsuario = await this.prisma.$transaction(async (tx) => {
        const { empresaId, registradoPorId } = deleteUsuarioDto;
        const buscar = await this.findOne(id);
        if (buscar.status === true) {
          this.logger.warn(
            `Usuário id ${id} não está inativo para ser deletado.`,
          );
          throw new UnauthorizedException();
        }
        if (buscar.empresaId !== empresaId) {
          this.logger.warn(
            `Usuário id ${id} não pertence a empresa para ser deletado.`,
          );
          throw new UnauthorizedException();
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
          empresaId: empresaId,
          registradoPorId: registradoPorId,
        };

        await this.auditoria.create(dadosAuditoria);
      });

      this.logger.log(`Usuário id ${id} deletado com sucesso.`);
      return plainToClass(ResponseUsuarioDto, deletarUsuario);
    } catch (error) {
      this.logger.error('Falha ao deletar usuário.');
      throw error;
    }
  }

  // DELETA TODOS USUARIOS MEDIANTE O DELETE DE UMA EMPRESA
  async removeAll(
    deleteUsuarioDto: DeleteUsuarioDto,
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    try {
      const executar = async (
        client: Prisma.TransactionClient | PrismaService,
      ) => {
        const { empresaId, registradoPorId } = deleteUsuarioDto;

        const listar = await client.usuario.findMany({
          where: { empresaId: empresaId },
        });

        if (listar.length === 0) {
          this.logger.warn('Lista de usuário vazia.');
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
            empresaId: empresaId,
            registradoPorId: registradoPorId,
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

      this.logger.log(
        `Usuários da empresa id ${deleteUsuarioDto.empresaId} deletados com sucesso.`,
      );
    } catch (error) {
      this.logger.error('Falha ao deletar os usuários cadastrados na empresa.');
      throw error;
    }
  }

  // METODO DE COMPARAÇÃO DE HASH
  async compareHash(currentHash: string, newHash: string): Promise<boolean> {
    const vadidadorHash = await bcrypt.compare(newHash, currentHash);
    this.logger.debug(
      `Condição: ${vadidadorHash} - senha atual: ${currentHash} - senha nova: ${newHash}`,
    );
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
