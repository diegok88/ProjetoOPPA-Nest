import { PerfilService } from '@/modules/perfil/perfil.service';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { AuthUser } from '../entities/auth-user.interface';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class WsRolesGuard implements CanActivate {
  private logger = new Logger(WsRolesGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly perfil: PerfilService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!roles?.length) return true;

    const client = context.switchToWs().getClient<Socket>();
    const user = client.data.user as AuthUser | undefined;
    if (!user) throw new WsException('Não autenticado');

    const perfil = await this.perfil.findOne(user.perfil);

    this.logger.debug('[WsRolesGuard]', {
      userUsuario: user.userId,
      userPerfil: user.perfil,
      perfilEncontrado: perfil,
      autorizado: perfil ? `${perfil.descricao} - ${perfil.nivel}` : null,
      rolesEsperadas: roles,
    });
    if (!perfil) throw new WsException('Sem permissão para esta ação');

    const autorizado = `${perfil.descricao} - ${perfil.nivel}`;
    if (!roles.includes(autorizado)) {
      throw new WsException('Sem permissão para esta ação');
    }
    return true;
  }
}
