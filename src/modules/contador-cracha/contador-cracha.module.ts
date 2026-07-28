import { forwardRef, Module } from '@nestjs/common';
import { ContadorCrachaController } from './contador-cracha.controller';
import { ContadorCrachaService } from './contador-cracha.service';
import { AuditoriaModule } from '../auditoria/auditoria.module';

@Module({
  imports: [forwardRef(() => AuditoriaModule)],
  controllers: [ContadorCrachaController],
  providers: [ContadorCrachaService],
  exports: [ContadorCrachaService],
})
export class ContadorCrachaModule {}
