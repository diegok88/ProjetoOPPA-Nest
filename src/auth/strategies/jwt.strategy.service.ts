import { UsuarioService } from '@/modules/usuario/usuario.service';
import { TYPES_NOTICES } from '@/utils/types-notices.cosnt';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategyService extends PassportStrategy(Strategy) {
  private logger = new Logger(JwtStrategyService.name);

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
      versao: payload.versao,
    };
  }
}
