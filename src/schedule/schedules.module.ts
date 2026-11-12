import { Module } from '@nestjs/common';
import { PenalidadesScheduleService } from './penalidades-schedule.service';
import { DispensasScheduleService } from './dispensas-schedule.service';
import { AlocacaoScheduleService } from './alocacao-schedule.service';
import { GeradorEscalaModule } from '@/modules/gerador-escala/gerador-escala.module';

@Module({
  imports: [GeradorEscalaModule],
  providers: [
    PenalidadesScheduleService,
    DispensasScheduleService,
    AlocacaoScheduleService,
  ],
})
export class SchedulesModule {}
