import { forwardRef, Module } from '@nestjs/common';
import { DispensasService } from './dispensas.service';
import { DispensasController } from './dispensas.controller';
import { PerfilModule } from '../perfil/perfil.module';

@Module({
  imports: [forwardRef(() => PerfilModule)],
  controllers: [DispensasController],
  providers: [DispensasService],
})
export class DispensasModule {}
