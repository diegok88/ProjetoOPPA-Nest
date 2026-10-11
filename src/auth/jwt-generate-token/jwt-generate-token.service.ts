import { Injectable } from '@nestjs/common';
import { Auth } from '../entities/auth.entity';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class GenerateTokenService {
  constructor(private readonly jwtService: JwtService) {}

  // GERADOR DE TOKEN
  async generateToken(token: Auth) {
    const payload = {
      sub: token.userId,
      perfil: token.perfil,
      empresa: token.empresa,
      versaoToken: token.versaoToken,
    };
    return this.jwtService.sign(payload);
  }
}
