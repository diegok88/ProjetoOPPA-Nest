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
export class RolesGuard implements CanActivate {
  private logger = new Logger(RolesGuard.name);

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
    const { descricao } = perfil;

    const perfilAutorizado = perfilObrigatorio.some((perfil) => {
      return descricao === perfil;
    });

    if (!perfilAutorizado) {
      this.logger.warn('Perfil não autorizado!');
      throw new UnauthorizedException();
    }

    return true;
  }
}
