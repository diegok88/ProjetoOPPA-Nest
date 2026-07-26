import { Acao } from '@/generated/prisma/enums';
import { AuditoriaService } from '@/modules/auditoria/auditoria.service';
import { CreateAuditoriaDto } from '@/modules/auditoria/dto/create-auditoria.dto';
import {
  QueryGenerateTokenDto,
  QueryUsuarioDto,
} from '@/modules/usuario/dto/query-usuario.dto';
import { UsuarioService } from '@/modules/usuario/usuario.service';
import { PrismaService } from '@/prisma/prisma.service';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { plainToClass } from 'class-transformer';
import { Response } from 'express';
import { LoginDto } from './dto/create-auth.dto';
import {
  ResponseAuthDto,
  ResponseAuthValidateDto,
} from './dto/response-auth.dto';
import { AuthenticatedRequest } from './express/authenticated-request.interface';

@Injectable()
export class AuthService {
  private logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly usuario: UsuarioService,
    private readonly auditoria: AuditoriaService,
    private readonly prisma: PrismaService,
  ) {}

  async validateUser(loginDto: LoginDto): Promise<ResponseAuthValidateDto> {
    try {
      const verificar: QueryUsuarioDto = {
        cracha: loginDto.cracha,
        senha: loginDto.senha,
        empresaId: loginDto.empresaId,
      };

      const validarUsuario =
        await this.usuario.findOneBadgeAndEnterprice(verificar);

      const validarSenha = await this.usuario.compareHash(
        validarUsuario.senha,
        loginDto.senha,
      );

      if (!validarSenha || !validarUsuario) {
        this.logger.warn(`Usuário crachá ${loginDto.cracha} não autorizado.`);
        throw new UnauthorizedException();
      }

      this.logger.log('Validação do usuário realizado com sucesso.');

      return plainToClass(ResponseAuthValidateDto, validarUsuario);
    } catch (error) {
      this.logger.error('Falha ao validar o usuário.');
      throw error;
    }
  }

  async generateToken(query: QueryGenerateTokenDto) {
    const payload = {
      sub: query.id,
      perfil: query.perfilId,
    };

    return this.jwtService.sign(payload);
  }

  async findProfile(id: string): Promise<ResponseAuthDto> {
    const usuario = await this.usuario.findOne(id);

    if (!usuario) throw new UnauthorizedException();

    return plainToClass(ResponseAuthDto, usuario);
  }

  async login(
    res: Response,
    req: AuthenticatedRequest,
    login: LoginDto,
  ): Promise<{ message: string; usuario: number }> {
    const loginUsuario = await this.prisma.$transaction(async (tx) => {
      const validar = await this.validateUser(login);

      const token = await this.generateToken(validar);

      res.cookie('jwt', token, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000,
      });

      const dadosAuditoria: CreateAuditoriaDto = {
        entidade: 'AUTH',
        registroId: validar.id,
        acao: Acao.LOGIN,
        dadosRegistrados: req.user,
        empresaId: login.empresaId,
        registradoPorId: validar.id,
      };

      await this.auditoria.create(dadosAuditoria, tx);

      this.logger.log(`Token gerado: ${token}`);
    });

    this.logger.log('Login realizado com sucesso!');

    return { message: 'Autenticado com sucesso!', usuario: login.cracha };
  }

  async logout(
    res: Response,
    req: AuthenticatedRequest,
  ): Promise<{ message: string }> {
    const usuario = await this.usuario.findOne(req.user.userId);

    const dadosAuditoria: CreateAuditoriaDto = {
      entidade: 'AUTH',
      registroId: usuario.id,
      acao: Acao.LOGOUT,
      dadosRegistrados: req.user,
      empresaId: usuario.empresaId,
      registradoPorId: usuario.id,
    };

    await this.auditoria.create(dadosAuditoria);

    res.clearCookie('jwt');

    this.logger.log('Logout realizado com sucesso!');

    return { message: 'Logout realizado' };
  }
}
