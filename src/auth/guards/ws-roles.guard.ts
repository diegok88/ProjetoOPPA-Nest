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
import { ehPerfilId, perfilEm, type PerfilLike } from './roles.const';

@Injectable()
export class WsRolesGuard implements CanActivate {
  private readonly logger = new Logger(WsRolesGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly perfil: PerfilService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const exigidos = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!exigidos?.length) return true;

    const client = context.switchToWs().getClient<Socket>();
    const user = client.data.user as AuthUser | undefined;

    if (!user) throw new WsException('Não autenticado');

    /**
     * PerfilLike | null desde a declaração — `findOne` devolve null.
     * O ?? null converte o undefined do cache em null para manter um só tipo.
     */
    let perfilAtual: PerfilLike | null =
      (client.data.perfil as PerfilLike | undefined) ?? null;

    if (!perfilAtual) {
      if (!ehPerfilId(user.perfil)) {
        // token legado com a etiqueta no lugar do ID
        perfilAtual = { descricao: user.perfil };
      } else {
        try {
          perfilAtual = (await this.perfil.findOne(
            user.perfil,
          )) as PerfilLike | null;
        } catch {
          perfilAtual = null;
        }

        if (!perfilAtual) {
          this.logger.warn(`Perfil não encontrado: ${user.perfil}`);
          throw new WsException('Sem permissão para esta ação');
        }
      }

      // cache por socket: evita 1 query de perfil por mensagem recebida
      client.data.perfil = perfilAtual;
    }

    if (perfilAtual.status === false) {
      throw new WsException('Sem permissão para esta ação');
    }

    if (!perfilEm(perfilAtual, exigidos)) {
      this.logger.debug('[WsRolesGuard] acesso negado', {
        userId: user.userId,
        perfilId: user.perfil,
        perfilBanco: `${perfilAtual.descricao ?? '-'} - ${perfilAtual.nivel ?? '-'}`,
        exigidos,
      });
      throw new WsException('Sem permissão para esta ação');
    }

    return true;
  }
}

/*

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

*/
