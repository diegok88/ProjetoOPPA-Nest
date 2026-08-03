import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategyService extends PassportStrategy(Strategy) {
  private logger = new Logger(JwtStrategyService.name);

  constructor() {
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
    this.logger.log('validate()');
    this.logger.debug(payload);
    return {
      userId: payload.sub,
      perfil: payload.perfil,
      empresa: payload.empresa,
    };
  }
}
