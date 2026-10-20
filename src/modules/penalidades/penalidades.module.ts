import { forwardRef, Module } from '@nestjs/common';
import { PenalidadesService } from './penalidades.service';
import { PenalidadesController } from './penalidades.controller';
import { PerfilModule } from '../perfil/perfil.module';
import { DispensasOrquestradorModule } from '@/services-orchestrator/dispensas/dispensas-orquestrador.module';

@Module({
  imports: [forwardRef(() => PerfilModule), DispensasOrquestradorModule],
  controllers: [PenalidadesController],
  providers: [PenalidadesService],
  exports: [PenalidadesService],
})
export class PenalidadesModule {}
