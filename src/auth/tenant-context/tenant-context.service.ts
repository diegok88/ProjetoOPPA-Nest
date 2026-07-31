import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { UserContext } from './user-context.interface';

@Injectable()
export class TenantContextService {
  private readonly als = new AsyncLocalStorage<UserContext>();

  run<T>(context: UserContext, callback: () => T): T {
    return this.als.run(context, callback);
  }

  getStore(): UserContext | undefined {
    return this.als.getStore();
  }
}
