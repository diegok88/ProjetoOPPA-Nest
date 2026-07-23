import { Module } from '@nestjs/common';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { ContadorCrachaService } from '../contador-cracha/contador-cracha.service';
import { EmpresaController } from './empresa.controller';
import { EmpresaService } from './empresa.service';
import { UsuarioService } from '../usuario/usuario.service';
import { UsuarioModule } from '../usuario/usuario.module';
import { AuditoriaModule } from '../auditoria/auditoria.module';
import { ContadorCrachaModule } from '../contador-cracha/contador-cracha.module';

@Module({
  imports: [UsuarioModule, AuditoriaModule, ContadorCrachaModule],
  controllers: [EmpresaController],
  providers: [EmpresaService],
  exports: [EmpresaService],
})
export class EmpresaModule {}
