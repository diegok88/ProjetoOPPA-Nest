import { forwardRef, Module } from '@nestjs/common';
import { OcorrenciaService } from './ocorrencia.service';
import { OcorrenciaController } from './ocorrencia.controller';
import { PerfilModule } from '../perfil/perfil.module';
import { FluxoOcorrenciaModule } from '../fluxo-ocorrencia/fluxo-ocorrencia.module';

@Module({
  imports: [forwardRef(() => PerfilModule), FluxoOcorrenciaModule],
  controllers: [OcorrenciaController],
  providers: [OcorrenciaService],
  exports: [OcorrenciaService],
})
export class OcorrenciaModule {}
