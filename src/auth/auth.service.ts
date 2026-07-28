import { Acao } from '@/generated/prisma/enums';
import { AuditoriaService } from '@/modules/auditoria/auditoria.service';
import { CreateAuditoriaDto } from '@/modules/auditoria/dto/create-auditoria.dto';
import { QueryAuditoriaFindOneLastDto } from '@/modules/auditoria/dto/query-auditoria.dto';
import { QueryUsuarioDto } from '@/modules/usuario/dto/query-usuario.dto';
import { UsuarioService } from '@/modules/usuario/usuario.service';
import { PrismaService } from '@/prisma/prisma.service';
import { TYPES_NOTICES } from '@/utils/types-notices.cosnt';
import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { plainToClass } from 'class-transformer';
import { LoginDto } from './dto/create-auth.dto';
import { ResponseAuthDto } from './dto/response-auth.dto';

@Injectable()
export class AuthService {
  private logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly usuario: UsuarioService,
    private readonly auditoria: AuditoriaService,
    private readonly prisma: PrismaService,
  ) {}

  // GERADOR DE TOKEN
  async generateToken(id: string, perfilId: string) {
    const payload = {
      sub: id,
      perfil: perfilId,
    };

    return this.jwtService.sign(payload);
  }

  // OBTER O PERFIL - criar entidade usuario para tipar o retorno
  async findProfile(id: string): Promise<ResponseAuthDto> {
    const usuario = await this.usuario.findOne(id);
    if (!usuario) throw new UnauthorizedException();
    return plainToClass(ResponseAuthDto, usuario);
  }

  // LOGIN DO USUARIO
  async login(login: LoginDto): Promise<string> {
    try {
      const loginUsuario = await this.prisma.$transaction(async (tx) => {
        const verificar: QueryUsuarioDto = {
          cracha: login.cracha,
          senha: login.senha,
          empresaId: login.empresaId,
        };
        const validarUsuario =
          await this.usuario.findOneBadgeAndEnterprice(verificar);
        if (!validarUsuario) {
          this.logger.warn(`Usuário crachá ${login.cracha} não encontrado.`);
          throw new NotFoundException();
        }
        const { senha, perfilId, id, empresaId, cracha } = validarUsuario;
        if (verificar.cracha !== cracha || verificar.empresaId !== empresaId) {
          this.logger.warn('Usuário com credenciais não autorizado.');
          throw new UnauthorizedException();
        }
        const validarSenha = this.usuario.compareHash(senha, login.senha);
        if (!validarSenha) {
          this.logger.warn(`Usuário crachá ${login.cracha} não autorizado.`);
          throw new UnauthorizedException();
        }
        const token = await this.generateToken(id, perfilId);
        this.logger.log('Token gerado com sucesso!');
        const dadosAuditoria: CreateAuditoriaDto = {
          entidade: 'AUTH',
          registroId: id,
          acao: Acao.LOGIN,
          dadosRegistrados: token,
          empresaId: login.empresaId,
          registradoPorId: id,
        };
        await this.auditoria.create(dadosAuditoria, tx);
        return token;
      });
      this.logger.log('Login realizado com sucesso!');
      return loginUsuario;
    } catch (error) {
      this.logger.error('Falha ao logar o usuário!');
      throw error;
    }
  }

  // LOGOUT DO USUARIO
  async logout(usuario: string): Promise<void> {
    try {
      const buscar = await this.usuario.findOne(usuario);
      const queryAuditoria: QueryAuditoriaFindOneLastDto = {
        acao: Acao.LOGIN,
        empresaId: buscar.empresaId,
        registradoPorId: buscar.id,
      };
      const auditoria = await this.auditoria.findOneLast(queryAuditoria);
      const dadosAuditoria: CreateAuditoriaDto = {
        entidade: 'AUTH',
        registroId: buscar.id,
        acao: Acao.LOGOUT,
        dadosRegistrados: auditoria.dadosRegistrados,
        empresaId: buscar.empresaId,
        registradoPorId: buscar.id,
      };
      await this.auditoria.create(dadosAuditoria);
      this.logger.log('Logout realizado com sucesso!');
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE);
      throw error;
    }
  }
}
