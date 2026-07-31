import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { TenantContextService } from './tenant-context.service';

@Injectable()
export class TenantContextInterceptor implements NestInterceptor {
  constructor(private readonly tenantContextService: TenantContextService) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (user) {
      const userContext = {
        user: user.userId,
        perfil: user.perfil,
        empresa: user.empresa,
      };

      return new Observable((subscriber) => {
        this.tenantContextService.run(userContext, () => {
          next.handle().subscribe(subscriber);
        });
      });
    }
    return next.handle();
  }
}
