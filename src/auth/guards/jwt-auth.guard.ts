import {
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from './public.decorator';
import { TYPES_NOTICES } from '@/utils/types-notices.cosnt';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private logger = new Logger(JwtAuthGuard.name);

  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    return super.canActivate(context);
  }

  handleRequest(error: any, user: any) {
    this.logger.log('handleRequest()');
    if (error) {
      this.logger.error(TYPES_NOTICES.TOKEN_INVALID);
      throw new UnauthorizedException(`Token inválido: ${error.message}`);
    }
    if (!user) {
      this.logger.error(TYPES_NOTICES.UNAUTHORIZED);
      throw error || new UnauthorizedException(`Usuário inválido`);
    }
    return user;
  }
}
