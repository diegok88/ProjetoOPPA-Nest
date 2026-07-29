import { forwardRef, Module } from '@nestjs/common';
import { AuditoriaController } from './auditoria.controller';
import { AuditoriaService } from './auditoria.service';
import { PerfilModule } from '../perfil/perfil.module';

@Module({
  imports: [forwardRef(() => PerfilModule)],
  controllers: [AuditoriaController],
  providers: [AuditoriaService],
  exports: [AuditoriaService],
})
export class AuditoriaModule {}
