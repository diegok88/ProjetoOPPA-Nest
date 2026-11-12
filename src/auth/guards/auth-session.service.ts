import { UsuarioService } from '@/modules/usuario/usuario.service';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthUser, JwtPayload } from '../entities/auth-user.interface';

@Injectable()
export class AuthSessionService {
  constructor(
    private readonly usuario: UsuarioService,
    private readonly jwt: JwtService,
  ) {}

  /** Verifica assinatura, expiração e versão da sessão. Retorna null se inválido. */
  async authenticateToken(token: string): Promise<AuthUser | null> {
    let payload: JwtPayload;
    try {
      payload = await this.jwt.verifyAsync<JwtPayload>(token);
    } catch {
      return null;
    }
    return this.validate(payload);
  }

  /** Confere se a sessão do payload ainda é válida. */
  async validate(payload: JwtPayload): Promise<AuthUser | null> {
    const usuario = await this.usuario.findOne(payload.sub);
    if (!usuario || usuario.versaoToken !== payload.versaoToken) return null;

    return {
      userId: payload.sub,
      perfil: payload.perfil,
      empresa: payload.empresa,
      versaoToken: payload.versaoToken,
    };
  }
}
