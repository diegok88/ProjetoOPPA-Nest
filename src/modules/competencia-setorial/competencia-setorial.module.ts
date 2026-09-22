import { Module } from '@nestjs/common';
import { CompetenciaSetorialService } from './competencia-setorial.service';
import { CompetenciaSetorialController } from './competencia-setorial.controller';

@Module({
  controllers: [CompetenciaSetorialController],
  providers: [CompetenciaSetorialService],
})
export class CompetenciaSetorialModule {}
