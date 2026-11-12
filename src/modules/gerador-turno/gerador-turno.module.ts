import { Module } from '@nestjs/common';
import { GeradorTurnoService } from './gerador-turno.service';
import { GeradorTurnoController } from './gerador-turno.controller';

@Module({
  controllers: [GeradorTurnoController],
  providers: [GeradorTurnoService],
  exports: [GeradorTurnoService],
})
export class GeradorTurnoModule {}
