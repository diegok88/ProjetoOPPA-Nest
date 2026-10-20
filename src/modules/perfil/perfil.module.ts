import { forwardRef, Module } from '@nestjs/common';
import { PerfilService } from './perfil.service';
import { PerfilController } from './perfil.controller';
import { UsuarioOrquestradorModule } from '@/services-orchestrator/usuario/usuario-orquestrador.module';

@Module({
  imports: [UsuarioOrquestradorModule],
  controllers: [PerfilController],
  providers: [PerfilService],
  exports: [PerfilService],
})
export class PerfilModule {}
