import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { ResponseUsuarioDto } from './dto/response-usuario.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { EmpresaService } from '../empresa/empresa.service';
import { plainToClass } from 'class-transformer';
import { PerfilService } from '../perfil/perfil.service';
import * as bcrypt from 'bcrypt';
import { UpdateDataUsuarioDto } from './dto/update-data-usuario.dto';
import { UpdatePasswordUsuarioDto } from './dto/update-password-usuario.dto';
import { UpdatePinUsuarioDto } from './dto/update-pin-usuario.dto';
import { ResponseActiveUsuario } from './dto/response-active-usuario.dto';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { CreateAuditoriaDto } from '../auditoria/dto/create-auditoria.dto';

@Injectable()
export class UsuarioService {
  private logger = new Logger(UsuarioService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly perfil: PerfilService,
    private readonly empresa: EmpresaService,
    private readonly auditoria: AuditoriaService,
  ) {}
  // CRIAR USUARIO
  async create(
    createUsuarioDto: CreateUsuarioDto,
  ): Promise<ResponseUsuarioDto> {
    // Criptografia dos dados senha e pin
    const { senha, pin, registradoPorId, ...dadosUsuario } = createUsuarioDto;
    const senhaHash = await this.generateHash(senha);
    const pinHash = await this.generateHash(pin);
    try {
      // Multipla consulta para identificar a existencia dos dados
      const [verificarPerfil, verificarEmpresa] = await Promise.all([
        this.perfil.findOne(createUsuarioDto.perfilId),
        this.empresa.findOne(createUsuarioDto.empresaId),
      ]);
      // Condição para determinar se os dados não estão vazios
      if (!verificarPerfil || !verificarEmpresa) {
        const idsAusentes: string[] = [];
        if (!verificarPerfil)
          idsAusentes.push(`Perfil: ${createUsuarioDto.perfilId}`);
        if (!verificarEmpresa)
          idsAusentes.push(`Empresa: ${createUsuarioDto.empresaId}`);
        this.logger.warn(`Ids não encontrados: ${idsAusentes.join(', ')}`);
        throw new NotFoundException('Ids não encontrados.');
      }
      const novoUsuario = await this.prisma.$transaction(async (tx) => {
        // Criação do novo usuario
        const criarUsuario = tx.usuario.create({
          data: {
            ...dadosUsuario,
            senha: senhaHash,
            pin: pinHash,
          },
        });
        const auditoriaDados: CreateAuditoriaDto = {
          entidade: 'USUARIO',
          registroId: (await criarUsuario).id,
          acao: 'CREATE',
          dadosRegistrados: {
            cracha: (await criarUsuario).cracha,
            nome: (await criarUsuario).nome,
            dataNascimento: (await criarUsuario).dataNascimento,
            dataAdmissao: (await criarUsuario).dataAdmissao,
            perfil: (await criarUsuario).perfilId,
            escala: (await criarUsuario).nome,
            turno: (await criarUsuario).nome,
            empresa: (await criarUsuario).empresaId,
          },
          registradoPorId: registradoPorId,
        };
        // Criação de registro de auditoria
        await this.auditoria.create(auditoriaDados);
        return criarUsuario;
      });
      return plainToClass(ResponseUsuarioDto, novoUsuario);
    } catch (error) {
      throw error;
    }
  }
  // LISTA OS USUARIOS
  async findAll(): Promise<ResponseUsuarioDto[]> {
    try {
      const listarUsuarios = await this.prisma.usuario.findMany({
        include: {
          perfil: true,
          empresa: true,
        },
      });
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
        include: {
          perfil: true,
          empresa: true,
        },
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
    id: string,
    updateUsuarioDto: UpdateUsuarioDto,
  ): Promise<ResponseUsuarioDto> {
    try {
      const atualizarUsuario = await this.prisma.usuario.update({
        where: { id: id },
        data: updateUsuarioDto,
      });
      this.logger.log(`Usuário id ${id} atuaalizado com sucesso.`);
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
      const atualizarUsuario = await this.prisma.usuario.update({
        where: { id: id },
        data: updateDataUsuarioDto,
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
