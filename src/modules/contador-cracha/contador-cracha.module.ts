import { Module } from '@nestjs/common';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { ContadorCrachaController } from './contador-cracha.controller';
import { ContadorCrachaService } from './contador-cracha.service';

@Module({
  controllers: [ContadorCrachaController],
  providers: [ContadorCrachaService, AuditoriaService],
})
export class ContadorCrachaModule {}
