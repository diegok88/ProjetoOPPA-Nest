import { forwardRef, Module } from '@nestjs/common';
import { FluxoOcorrenciaService } from './fluxo-ocorrencia.service';
import { FluxoOcorrenciaController } from './fluxo-ocorrencia.controller';
import { PerfilModule } from '../perfil/perfil.module';
import { UsuarioModule } from '../usuario/usuario.module';

@Module({
  imports: [forwardRef(() => PerfilModule), UsuarioModule],
  controllers: [FluxoOcorrenciaController],
  providers: [FluxoOcorrenciaService],
  exports: [FluxoOcorrenciaService],
})
export class FluxoOcorrenciaModule {}
