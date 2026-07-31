import { forwardRef, Module } from '@nestjs/common';
import { AuditoriaModule } from '../auditoria/auditoria.module';
import { ContadorCrachaModule } from '../contador-cracha/contador-cracha.module';
import { PerfilModule } from '../perfil/perfil.module';
import { UsuarioController } from './usuario.controller';
import { UsuarioService } from './usuario.service';
import { AuthService } from '@/auth/auth.service';
import { GestorModule } from '../gestor/gestor.module';

@Module({
  imports: [
    forwardRef(() => AuditoriaModule),
    forwardRef(() => PerfilModule),
    forwardRef(() => GestorModule),
    ContadorCrachaModule,
  ],
  controllers: [UsuarioController],
  providers: [UsuarioService],
  exports: [UsuarioService],
})
export class UsuarioModule {}
