import { PasswordPin } from '@/constants/password-pin.const';
import { PrismaService } from '@/prisma/prisma.service';
import {
  ExtractDataAuditoria,
  ExtractRegisteredById,
} from '@/utils/extract-data-auditoria.util';
import { StructureDataAuditoriaCreate } from '@/utils/structure-data-auditoria.util';
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
import { EmpresaService } from '../empresa/empresa.service';
import { PerfilService } from '../perfil/perfil.service';
import {
  CreateUsuarioAdmin,
  CreateUsuarioDto,
  CreateUsuarioMaster,
} from './dto/create-usuario.dto';
import { ResponseActiveUsuario } from './dto/response-active-usuario.dto';
import { ResponseUsuarioDto } from './dto/response-usuario.dto';
import { UpdateDataUsuarioDto } from './dto/update-data-usuario.dto';
import { UpdatePasswordUsuarioDto } from './dto/update-password-usuario.dto';
import { UpdatePinUsuarioDto } from './dto/update-pin-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { ContadorCrachaService } from '../contador-cracha/contador-cracha.service';
import { UpdateContadorCrachaDto } from '../contador-cracha/dto/update-contador-cracha.dto';

@Injectable()
export class UsuarioService {
  private logger = new Logger(UsuarioService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly perfil: PerfilService,
    private readonly empresa: EmpresaService,
    private readonly contadorCracha: ContadorCrachaService,
    private readonly auditoria: AuditoriaService,
  ) {}
  // CRIAR USUARIO MASTER - acesso ao usuario principal
  async createMaster(
    createUsuarioMaster: CreateUsuarioMaster,
  ): Promise<ResponseUsuarioDto> {
    try {
      const { senha, pin, ...dados } = createUsuarioMaster;
      const senhaHash = await this.generateHash(senha);
      const pinHash = await this.generateHash(pin);

      const criar = await this.prisma.usuario.create({
        data: {
          ...dados,
          senha: senhaHash,
          pin: pinHash,
        },
      });

      this.logger.log('Usuário master criado com sucesso.');
      return plainToClass(ResponseUsuarioDto, criar);
    } catch (error) {
      this.logger.error('Falha ao cadastrar usuário master');
      throw error;
    }
  }
  // CRIAR USUARIO ADMINISTRADOR DO SISTEMA - o mesmo é criado mediante empresa, contador de cracha e perfil criados
  async createAdmin(
    createUsuarioAdmin: CreateUsuarioAdmin,
  ): Promise<ResponseUsuarioDto> {
    try {
      const dadosSemRegistradoPorId =
        await ExtractRegisteredById(createUsuarioAdmin);

      const criarUsuario = await this.prisma.$transaction(async (tx) => {
        const senhaHash = await this.generateHash(PasswordPin.password);
        const pinHash = await this.generateHash(PasswordPin.pin);

        const dadosContador: UpdateContadorCrachaDto = {
          empresaId: createUsuarioAdmin.empresaId,
          registradoPorId: createUsuarioAdmin.registradoPorId,
        };
        const novoCracha =
          await this.contadorCracha.updateAccountant(dadosContador);

        const criar = await tx.usuario.create({
          data: {
            ...dadosSemRegistradoPorId,
            cracha: novoCracha.contador,
            senha: senhaHash,
            pin: pinHash,
            empresaId: createUsuarioAdmin.empresaId,
          },
        });

        const dadosSemId = await ExtractDataAuditoria(criar);

        const dadosAuditoria = await StructureDataAuditoriaCreate(
          'USUARIO',
          criar.id,
          dadosSemId,
          createUsuarioAdmin.registradoPorId,
        );

        await this.auditoria.create(dadosAuditoria);
        return criar;
      });
      this.logger.log('Usuário cadastrado com sucesso.');
      return plainToClass(ResponseUsuarioDto, criarUsuario);
    } catch (error) {
      this.logger.error('Falha ao cadastrar usuário.');
      throw error;
    }
  }
  // LISTA OS USUARIOS
  async findAll(): Promise<ResponseUsuarioDto[]> {
    try {
      const listarUsuarios = await this.prisma.usuario.findMany();
      this.logger.log('Lista de usuário gerada com sucesso.');
      return listarUsuarios.map((lista) =>
        plainToClass(ResponseUsuarioDto, lista),
      );
    } catch (error) {
      this.logger.error('Falha ao listar usuários.');
      throw error;
    }
  }
  // LISTA OS USUARIO ATIVOS
  async findAllActive(): Promise<ResponseActiveUsuario[]> {
    try {
      const listarAtivos = await this.prisma.usuario.findMany({
        where: { status: true },
        include: {
          perfil: {
            select: { descricao: true },
          },
        },
      });
      this.logger.log('Lista de usuários ativos gerada com sucesso.');
      return listarAtivos.map((lista) =>
        plainToClass(ResponseActiveUsuario, {
          ...lista,
          perfil: lista.perfil?.descricao || '',
        }),
      );
    } catch (error) {
      this.logger.error('Falha ao listar usuário ativos.');
      throw error;
    }
  }
  // BUSCA USUARIO PELO ID
  async findOne(id: string): Promise<ResponseUsuarioDto> {
    try {
      const buscaUsuario = await this.prisma.usuario.findUnique({
        where: { id: id },
      });

      if (!buscaUsuario) {
        this.logger.warn(`Usuário id ${id} não encontrado.`);
        throw new NotFoundException();
      } else {
        this.logger.log(`Usuário id ${id} gerado com sucesso.`);
      }

      return plainToClass(ResponseUsuarioDto, buscaUsuario);
    } catch (error) {
      this.logger.error('Falha na busca do usuário.');
      throw error;
    }
  }
  // ATUALIZA USUARIO PELO ID
  async update(
    idUser: string,
    updateUsuarioDto: UpdateUsuarioDto,
  ): Promise<ResponseUsuarioDto> {
    const { registradoPorId, ...dados } = updateUsuarioDto;
    try {
      const atualizarUsuario = await this.prisma.$transaction(async (tx) => {
        const buscar = await tx.usuario.findUnique({
          where: { id: idUser },
        });
        if (!buscar) {
          throw new NotFoundException();
        }
        const buscaDados = plainToClass(ResponseUsuarioDto, buscar);
        const antes = ExtractDataAuditoria(buscaDados);

        const atualizar = await tx.usuario.update({
          where: { id: idUser },
          data: dados,
        });
        const dadosAtualizados = plainToClass(ResponseUsuarioDto, atualizar);
        const depois = ExtractDataAuditoria(dadosAtualizados);

        this.logger.log(`Registrado por: ${updateUsuarioDto.registradoPorId}`);
        const dadosAuditoria: UpdateAuditoriaDto = {
          entidade: 'USUARIO',
          registroId: atualizar.id,
          acao: 'UPDATE',
          antes: antes,
          depois: depois,
          registradoPorId: registradoPorId,
        };
        await this.auditoria.update(dadosAuditoria);
        return atualizar;
      });
      this.logger.log(`Usuário id ${idUser} atuaalizado com sucesso.`);
      return plainToClass(ResponseUsuarioDto, atualizarUsuario);
    } catch (error) {
      this.logger.error('Falha ao atualizar usuário.');
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
  async deactive(id: string): Promise<ResponseUsuarioDto> {
    try {
      const buscarUsuario = await this.findOne(id);
      if (!buscarUsuario) {
        this.logger.warn(`Usuário id ${id} não encontrado.`);
        throw new NotFoundException();
      }
      const inativarUsuario = await this.prisma.usuario.update({
        where: { id: id },
        data: {
          dataDesligamento: new Date(),
          status: false,
        },
      });
      this.logger.log(`Usuário id ${id} inativado com sucesso.`);
      return plainToClass(ResponseUsuarioDto, inativarUsuario);
    } catch (error) {
      this.logger.error('Falha ao inativar usuário.');
      throw error;
    }
  }
  // DELETA O USUARIO
  async remove(id: string): Promise<ResponseUsuarioDto> {
    try {
      const deletarUsuario = await this.prisma.usuario.delete({
        where: { id: id },
      });
      this.logger.log(`Usuário id ${id} deletado com sucesso.`);
      return plainToClass(ResponseUsuarioDto, deletarUsuario);
    } catch (error) {
      this.logger.error('Falha ao deletar usuário.');
      throw error;
    }
  }
  // METODO DE COMPARAÇÃO DE HASH
  private async compareHash(
    currentHash: string,
    newHash: string,
  ): Promise<boolean> {
    const vadidadorHash = await bcrypt.compare(currentHash, newHash);
    return vadidadorHash;
  }
  // METODO PRIVADO DE CRIAÇÃO DE HASH
  private async generateHash(hash: string): Promise<string> {
    const novoHash = await bcrypt.hash(hash, 10);
    return novoHash;
  }
}
