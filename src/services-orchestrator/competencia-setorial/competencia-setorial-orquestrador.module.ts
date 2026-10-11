import { Module } from '@nestjs/common';
import { CompetenciaSetorialOrquestradorService } from './competencia-setorial-orquestrador.service';

@Module({
  providers: [CompetenciaSetorialOrquestradorService],
  exports: [CompetenciaSetorialOrquestradorService],
})
export class CompetenciaSetorialOrquestradorModule {}
