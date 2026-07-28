import { Module } from '@nestjs/common';
import { AuditoriaModule } from '../auditoria/auditoria.module';
import { ContadorCrachaModule } from '../contador-cracha/contador-cracha.module';
import { PerfilModule } from '../perfil/perfil.module';
import { UsuarioModule } from '../usuario/usuario.module';
import { EmpresaController } from './empresa.controller';
import { EmpresaService } from './empresa.service';

@Module({
  imports: [UsuarioModule, AuditoriaModule, ContadorCrachaModule, PerfilModule],
  controllers: [EmpresaController],
  providers: [EmpresaService],
  exports: [EmpresaService],
})
export class EmpresaModule {}
