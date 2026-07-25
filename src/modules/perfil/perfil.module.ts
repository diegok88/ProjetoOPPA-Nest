import { Module } from '@nestjs/common';
import { PerfilService } from './perfil.service';
import { PerfilController } from './perfil.controller';
import { AuditoriaModule } from '../auditoria/auditoria.module';
import { UsuarioModule } from '../usuario/usuario.module';

@Module({
  imports: [AuditoriaModule, UsuarioModule],
  controllers: [PerfilController],
  providers: [PerfilService],
  exports: [PerfilService],
})
export class PerfilModule {}
