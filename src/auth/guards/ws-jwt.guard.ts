import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { AuthSessionService } from './auth-session.service';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private readonly session: AuthSessionService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient<Socket>();
    const token = client.handshake.auth?.token as string | undefined;
    if (!token) throw new WsException('Não autenticado');

    const user = await this.session.authenticateToken(token);
    if (!user) {
      throw new WsException('Sessão inválida. Faça o login novamente.');
    }

    client.data.user = user;
    return true;
  }
}
