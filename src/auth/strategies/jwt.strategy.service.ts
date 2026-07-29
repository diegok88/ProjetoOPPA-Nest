import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Auth } from '../entities/auth.entity';

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

  async validate(payload: any): Promise<Auth> {
    this.logger.log('Validação da JwtStrategyService - validate( )');
    return {
      userId: payload.sub,
      empresa: payload.empresaId,
      perfil: payload.perfil,
    };
  }
}
