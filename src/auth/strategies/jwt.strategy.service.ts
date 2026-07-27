import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

interface JwtPayload {
  sub: string;
  perfil: string;
  iat?: number;
  exp?: number;
}

interface RequestUser {
  userId: string;
  perfil: string;
}

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

  async validate(payload: any): Promise<RequestUser> {
    this.logger.log('Validação da JwtStrategyService - validate( )');
    return {
      userId: payload.sub,
      perfil: payload.perfil,
    };
  }
}
