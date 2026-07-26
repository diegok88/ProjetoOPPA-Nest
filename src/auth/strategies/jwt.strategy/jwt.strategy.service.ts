import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';

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
      secretOrKey: 'secretKeyChangeMe',
    });
    this.logger.log('JWT_SECRET carregado:', process.env.JWT_SECRET);
  }

  async validate(payload: any): Promise<RequestUser> {
    // Criar validação com o banco de dados
    return {
      userId: payload.sub,
      perfil: payload.perfil,
    };
  }
}
