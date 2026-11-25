import { PerfilService } from '@/modules/perfil/perfil.service';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';
import { ehPerfilId, perfilEm, type PerfilLike } from './roles.const';

@Injectable()
export class HttpRolesGuard implements CanActivate {
  private readonly logger = new Logger(HttpRolesGuard.name);

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

    const request = context.switchToHttp().getRequest();
    const usuario = request.user;

    if (!usuario?.perfil) {
      throw new ForbiddenException('Usuário sem perfil vinculado');
    }

    /**
     * Tipado como PerfilLike | null desde a declaração:
     * `findOne` pode devolver null e a atribuição precisa ser compatível.
     */
    let alvo: PerfilLike | null;

    if (ehPerfilId(usuario.perfil)) {
      try {
        alvo = (await this.perfil.findOne(usuario.perfil)) as PerfilLike | null;
      } catch {
        alvo = null;
      }

      if (!alvo) {
        this.logger.warn(`Perfil não encontrado: ${usuario.perfil}`);
        throw new ForbiddenException('Sem permissão para acessar este recurso');
      }
    } else {
      // token legado: o campo traz a etiqueta, não o ID
      alvo = { descricao: usuario.perfil };
    }

    if (alvo.status === false) {
      this.logger.warn(`Perfil inativo: ${usuario.perfil}`);
      throw new ForbiddenException('Sem permissão para acessar este recurso');
    }

    if (!perfilEm(alvo, exigidos)) {
      this.logger.warn(
        `Perfil não autorizado: ${alvo.descricao ?? usuario.perfil} - ${alvo.nivel ?? '-'} ` +
          `(exigido: ${exigidos.join(' | ')})`,
      );
      throw new ForbiddenException('Sem permissão para acessar este recurso');
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
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class HttpRolesGuard implements CanActivate {
  private logger = new Logger(HttpRolesGuard.name);

  constructor(
    private reflector: Reflector,
    private readonly perfil: PerfilService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const perfilObrigatorio = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!perfilObrigatorio) return true;

    const solicitacao = context.switchToHttp().getRequest();

    const usuario = solicitacao.user;

    const perfil = await this.perfil.findOne(usuario.perfil);
    const autorizado = `${perfil.descricao} - ${perfil.nivel}`;

    const perfilAutorizado = perfilObrigatorio.some((perfil) => {
      return autorizado === perfil;
    });

    if (!perfilAutorizado) {
      this.logger.warn('Perfil não autorizado!');
      throw new UnauthorizedException();
    }

    return true;
  }
}

*/
