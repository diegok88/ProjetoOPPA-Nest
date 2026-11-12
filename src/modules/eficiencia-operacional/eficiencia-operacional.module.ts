import { Module } from '@nestjs/common';
import { EficienciaOperacionalService } from './eficiencia-operacional.service';
import { EficienciaOperacionalController } from './eficiencia-operacional.controller';

@Module({
  controllers: [EficienciaOperacionalController],
  providers: [EficienciaOperacionalService],
})
export class EficienciaOperacionalModule {}
