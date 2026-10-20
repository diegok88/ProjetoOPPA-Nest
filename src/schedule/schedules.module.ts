import { Module } from '@nestjs/common';
import { PenalidadesScheduleService } from './penalidades-schedule.service';
import { DispensasScheduleService } from './dispensas-schedule.service';

@Module({
  providers: [PenalidadesScheduleService, DispensasScheduleService],
})
export class SchedulesModule {}
