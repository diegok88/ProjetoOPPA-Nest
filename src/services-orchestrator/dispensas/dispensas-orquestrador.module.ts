import { Module } from '@nestjs/common';
import { DispensasOrquestradorService } from './dispensas-orquestrador.service';

@Module({
  providers: [DispensasOrquestradorService],
  exports: [DispensasOrquestradorService],
})
export class DispensasOrquestradorModule {}
