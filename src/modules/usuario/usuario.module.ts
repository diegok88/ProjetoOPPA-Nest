import { Module } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { UsuarioController } from './usuario.controller';
import { AuditoriaModule } from '../auditoria/auditoria.module';
import { ContadorCrachaModule } from '../contador-cracha/contador-cracha.module';

@Module({
  imports: [AuditoriaModule, ContadorCrachaModule],
  controllers: [UsuarioController],
  providers: [UsuarioService],
  exports: [UsuarioService],
})
export class UsuarioModule {}
