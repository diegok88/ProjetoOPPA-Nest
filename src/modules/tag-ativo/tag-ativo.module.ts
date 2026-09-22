import { forwardRef, Module } from '@nestjs/common';
import { TagAtivoService } from './tag-ativo.service';
import { TagAtivoController } from './tag-ativo.controller';
import { PerfilModule } from '../perfil/perfil.module';

@Module({
  imports: [forwardRef(() => PerfilModule)],
  controllers: [TagAtivoController],
  providers: [TagAtivoService],
})
export class TagAtivoModule {}
