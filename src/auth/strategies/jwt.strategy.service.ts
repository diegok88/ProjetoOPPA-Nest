import { TYPES_NOTICES } from '@/utils/types-notices.cosnt';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthSessionService } from '../guards/auth-session.service';
import { ConfigService } from '@nestjs/config';
import { AuthUser, JwtPayload } from '../entities/auth-user.interface';

@Injectable()
export class JwtStrategyService extends PassportStrategy(Strategy) {
  private logger = new Logger(JwtStrategyService.name);

  constructor(
    private readonly session: AuthSessionService,
    config: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(), // MOBILE: Authorization: Bearer <token>
        (req: Request) => req?.cookies?.jwt ?? null, // WEB: cookie jwt
      ]),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
    this.logger.log('JWT_SECRET carregado:', process.env.JWT_SECRET);
  }

  async validate(payload: JwtPayload): Promise<AuthUser> {
    const user = await this.session.validate(payload);
    if (!user) {
      throw new UnauthorizedException(
        'Sessão inválida. Faça o login novamente.',
      );
    }
    return user;
  }
}

/*
- alterado:
  constructor(private usuario: UsuarioService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req?.cookies?.jwt,
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET ?? 'projeto_oppa',
    });
    this.logger.log('JWT_SECRET carregado:', process.env.JWT_SECRET);
  }
  
    async validate(payload: any) {
    const usuario = await this.usuario.findOne(payload.sub);
    if (!usuario || usuario.versaoToken !== payload.versaoToken) {
      this.logger.warn(TYPES_NOTICES.UNAUTHORIZED);
      throw new UnauthorizedException(
        'Sessão invalida. Faça o login novamente.',
      );
    }
    this.logger.log('validate()');
    return {
      userId: payload.sub,
      perfil: payload.perfil,
      empresa: payload.empresa,
      versao: payload.versaoToken,
    };
  }
*/
