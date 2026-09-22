import { forwardRef, Module } from '@nestjs/common';
import { PenalidadesService } from './penalidades.service';
import { PenalidadesController } from './penalidades.controller';
import { PerfilModule } from '../perfil/perfil.module';

@Module({
  imports: [forwardRef(() => PerfilModule)],
  controllers: [PenalidadesController],
  providers: [PenalidadesService],
})
export class PenalidadesModule {}
