import { forwardRef, Module } from '@nestjs/common';
import { GestorService } from './gestor.service';
import { GestorController } from './gestor.controller';
import { AuditoriaModule } from '../auditoria/auditoria.module';
import { UsuarioModule } from '../usuario/usuario.module';

@Module({
  imports: [forwardRef(() => AuditoriaModule)],
  controllers: [GestorController],
  providers: [GestorService],
  exports: [GestorService],
})
export class GestorModule {}
