import { Module } from '@nestjs/common';
import { GestorOrquestradorService } from './gestor-orquestrador.service';

@Module({
  providers: [GestorOrquestradorService],
  exports: [GestorOrquestradorService],
})
export class GestorOrquestradorModule {}
