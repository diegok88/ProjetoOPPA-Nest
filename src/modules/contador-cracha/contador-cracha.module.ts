import { Module } from '@nestjs/common';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { ContadorCrachaController } from './contador-cracha.controller';
import { ContadorCrachaService } from './contador-cracha.service';
import { AuditoriaModule } from '../auditoria/auditoria.module';

@Module({
  imports: [AuditoriaModule],
  controllers: [ContadorCrachaController],
  providers: [ContadorCrachaService],
  exports: [ContadorCrachaService],
})
export class ContadorCrachaModule {}
