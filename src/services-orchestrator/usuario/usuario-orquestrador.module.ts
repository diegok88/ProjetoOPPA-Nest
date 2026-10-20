import { Module } from '@nestjs/common';
import { UsuarioOrquestradorService } from './usuario-orquestrador.service';

@Module({
  providers: [UsuarioOrquestradorService],
  exports: [UsuarioOrquestradorService],
})
export class UsuarioOrquestradorModule {}
