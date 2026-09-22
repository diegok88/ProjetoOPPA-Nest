import { forwardRef, Module } from '@nestjs/common';
import { FluxoOcorrenciaService } from './fluxo-ocorrencia.service';
import { FluxoOcorrenciaController } from './fluxo-ocorrencia.controller';
import { PerfilModule } from '../perfil/perfil.module';

@Module({
  imports: [forwardRef(() => PerfilModule)],
  controllers: [FluxoOcorrenciaController],
  providers: [FluxoOcorrenciaService],
})
export class FluxoOcorrenciaModule {}
