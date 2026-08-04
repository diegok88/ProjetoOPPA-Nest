import { forwardRef, Module } from '@nestjs/common';
import { ContadorCrachaController } from './contador-cracha.controller';
import { ContadorCrachaService } from './contador-cracha.service';
import { AuditoriaModule } from '../auditoria/auditoria.module';
import { PerfilModule } from '../perfil/perfil.module';

@Module({
  imports: [forwardRef(() => PerfilModule)],
  controllers: [ContadorCrachaController],
  providers: [ContadorCrachaService],
  exports: [ContadorCrachaService],
})
export class ContadorCrachaModule {}
