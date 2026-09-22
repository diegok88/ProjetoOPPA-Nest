import { Module } from '@nestjs/common';
import { SetoresService } from './setores.service';
import { SetoresController } from './setores.controller';

@Module({
  controllers: [SetoresController],
  providers: [SetoresService],
})
export class SetoresModule {}
