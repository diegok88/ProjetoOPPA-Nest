import { Module } from '@nestjs/common';
import { GestorService } from './gestor.service';
import { GestorController } from './gestor.controller';

@Module({
  controllers: [GestorController],
  providers: [GestorService],
})
export class GestorModule {}
