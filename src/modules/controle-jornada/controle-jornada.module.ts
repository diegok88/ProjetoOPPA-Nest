import { forwardRef, Module } from '@nestjs/common';
import { ControleJornadaService } from './controle-jornada.service';
import { ControleJornadaController } from './controle-jornada.controller';
import { PerfilModule } from '../perfil/perfil.module';

@Module({
  imports: [forwardRef(() => PerfilModule)],
  controllers: [ControleJornadaController],
  providers: [ControleJornadaService],
})
export class ControleJornadaModule {}
