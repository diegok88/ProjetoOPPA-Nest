import { Acao } from '@/generated/prisma/enums';
import { AuditoriaService } from '@/modules/auditoria/auditoria.service';
import { CreateAuditoriaDto } from '@/modules/auditoria/dto/create-auditoria.dto';
import { QueryAuditoriaFindOneLastDto } from '@/modules/auditoria/dto/query-auditoria.dto';
import { QueryEmpresaFilterDto } from '@/modules/empresa/dto/query-empresa.dto';
import { EmpresaService } from '@/modules/empresa/empresa.service';
import { QueryUsuarioDto } from '@/modules/usuario/dto/query-usuario.dto';
import { UsuarioService } from '@/modules/usuario/usuario.service';
import { PrismaService } from '@/prisma/prisma.service';
import { TYPES_NOTICES } from '@/utils/types-notices.cosnt';
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { plainToClass } from 'class-transformer';
import { LoginDto } from './dto/create-auth.dto';
import { ResponseAuthDto } from './dto/response-auth.dto';
import { Auth } from './entities/auth.entity';
import { UserContext } from './tenant-context/user-context.interface';

@Injectable()
export class AuthService {
  private logger = new Logger(AuthService.name);

  constructor(
    private readonly usuario: UsuarioService,
    private readonly empresa: EmpresaService,
    private readonly auditoria: AuditoriaService,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  // GERADOR DE TOKEN
  async generateToken(token: Auth) {
    const payload = {
      sub: token.userId,
      perfil: token.perfil,
      empresa: token.empresa,
    };
    this.logger.debug('generateToken()');
    return this.jwtService.sign(payload);
  }

  // OBTER O PERFIL - criar entidade usuario para tipar o retorno -
  async findProfile(id: string): Promise<ResponseAuthDto> {
    const usuario = await this.usuario.findOne(id);
    if (!usuario) throw new UnauthorizedException();
    return plainToClass(ResponseAuthDto, usuario);
  }

  // LOGIN DO USUARIO
  async login(login: LoginDto) {
    try {
      const loginUsuario = await this.prisma.$transaction(async (tx) => {
        this.logger.log('login()');
        const filtro: QueryEmpresaFilterDto = { codigo: login.codEmpresa };
        const empresa = await this.empresa.findEnterpriceOne(filtro);
        const verificar: QueryUsuarioDto = {
          cracha: login.cracha,
          senha: login.senha,
          empresaId: empresa.id,
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

        if (!perfilId) {
          this.logger.warn(TYPES_NOTICES.NOT_FOUND);
          throw new BadRequestException(TYPES_NOTICES.NOT_FOUND);
        }

        if (!empresaId) {
          this.logger.warn(TYPES_NOTICES.NOT_FOUND);
          throw new BadRequestException(TYPES_NOTICES.NOT_FOUND);
        }

        const dadosToken: Auth = {
          userId: id,
          perfil: perfilId,
          empresa: empresaId,
        };
        const token = await this.generateToken(dadosToken);

        this.logger.log('Token gerado com sucesso!');

        const dadosAuditoria: CreateAuditoriaDto = {
          entidade: 'AUTH',
          registroId: id,
          acao: Acao.LOGIN,
          dadosRegistrados: JSON.stringify(token),
          empresaId: empresaId,
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
  async logout(usuario: UserContext): Promise<void> {
    try {
      const buscar = await this.usuario.findOne(usuario.user);
      const queryAuditoria: QueryAuditoriaFindOneLastDto = {
        acao: Acao.LOGIN,
        empresaId: usuario.empresa,
        registradoPorId: usuario.user,
      };
      const auditoria = await this.auditoria.findOneLast(queryAuditoria);

      const dadosAuditoria: CreateAuditoriaDto = {
        entidade: 'AUTH',
        registroId: buscar.id,
        acao: Acao.LOGOUT,
        dadosRegistrados: auditoria.dadosRegistrados,
        empresaId: usuario.empresa,
        registradoPorId: usuario.user,
      };
      await this.auditoria.create(dadosAuditoria);
      this.logger.log(TYPES_NOTICES.LOGOUT);
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE);
      throw error;
    }
  }
}
