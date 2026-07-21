import { Module } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { UsuarioController } from './usuario.controller';
import { PerfilService } from '../perfil/perfil.service';
import { EmpresaService } from '../empresa/empresa.service';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { ContadorCrachaService } from '../contador-cracha/contador-cracha.service';

@Module({
  controllers: [UsuarioController],
  providers: [
    UsuarioService,
    PerfilService,
    EmpresaService,
    AuditoriaService,
    ContadorCrachaService,
  ],
})
export class UsuarioModule {}
