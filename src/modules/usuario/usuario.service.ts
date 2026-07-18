import { PrismaService } from '@/prisma/prisma.service';
import { ExtractDataAuditoria } from '@/utils/extract-data-auditoria.util';
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
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { ResponseActiveUsuario } from './dto/response-active-usuario.dto';
import { ResponseUsuarioDto } from './dto/response-usuario.dto';
import { UpdateDataUsuarioDto } from './dto/update-data-usuario.dto';
import { UpdatePasswordUsuarioDto } from './dto/update-password-usuario.dto';
import { UpdatePinUsuarioDto } from './dto/update-pin-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

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
    const { senha, pin, registradoPorId, ...dadosUsuario } = createUsuarioDto;
    const senhaHash = await this.generateHash(senha);
    const pinHash = await this.generateHash(pin);

    try {
      const [verificarPerfil, verificarEmpresa] = await Promise.all([
        this.perfil.findOne(createUsuarioDto.perfilId),
        this.empresa.findOne(createUsuarioDto.empresaId),
      ]);

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
        const criarUsuario = await tx.usuario.create({
          data: {
            ...dadosUsuario,
            senha: senhaHash,
            pin: pinHash,
          },
        });

        const dadosRegistrados = plainToClass(ResponseUsuarioDto, criarUsuario);
        const { id, ...dadosSemId } = dadosRegistrados;

        // Criação do registro na classe auditoria
        const auditoriaDados: CreateAuditoriaDto = {
          entidade: 'USUARIO',
          registroId: criarUsuario.id,
          acao: 'CREATE',
          dadosRegistrados: dadosSemId,
          registradoPorId: registradoPorId,
        };

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
          registradoPorId: updateUsuarioDto.registradoPorId,
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
