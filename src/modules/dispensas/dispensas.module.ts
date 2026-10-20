import { forwardRef, Module } from '@nestjs/common';
import { DispensasService } from './dispensas.service';
import { DispensasController } from './dispensas.controller';
import { PerfilModule } from '../perfil/perfil.module';
import { PenalidadesModule } from '../penalidades/penalidades.module';

@Module({
  imports: [forwardRef(() => PerfilModule), PenalidadesModule],
  controllers: [DispensasController],
  providers: [DispensasService],
  exports: [DispensasService],
})
export class DispensasModule {}
