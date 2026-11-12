import { forwardRef, Module } from '@nestjs/common';
import { TagAtivoService } from './tag-ativo.service';
import { TagAtivoController } from './tag-ativo.controller';
import { PerfilModule } from '../perfil/perfil.module';
import { AtivoModule } from '../ativo/ativo.module';
import { UsuarioModule } from '../usuario/usuario.module';

@Module({
  imports: [forwardRef(() => PerfilModule), AtivoModule, UsuarioModule],
  controllers: [TagAtivoController],
  providers: [TagAtivoService],
  exports: [TagAtivoService],
})
export class TagAtivoModule {}
