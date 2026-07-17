import { Module } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { UsuarioController } from './usuario.controller';
import { PerfilService } from '../perfil/perfil.service';
import { EmpresaService } from '../empresa/empresa.service';
import { PerfilModule } from '../perfil/perfil.module';
import { EmpresaModule } from '../empresa/empresa.module';
import { AuditoriaService } from '../auditoria/auditoria.service';

@Module({
  controllers: [UsuarioController],
  providers: [UsuarioService, PerfilService, EmpresaService, AuditoriaService],
})
export class UsuarioModule {}
