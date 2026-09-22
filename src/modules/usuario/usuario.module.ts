import { forwardRef, Module } from '@nestjs/common';
import { ContadorCrachaModule } from '../contador-cracha/contador-cracha.module';
import { PerfilModule } from '../perfil/perfil.module';
import { UsuarioController } from './usuario.controller';
import { UsuarioService } from './usuario.service';
import { GestorModule } from '../gestor/gestor.module';

@Module({
  imports: [
    forwardRef(() => PerfilModule),
    forwardRef(() => GestorModule),
    ContadorCrachaModule,
  ],
  controllers: [UsuarioController],
  providers: [UsuarioService],
  exports: [UsuarioService],
})
export class UsuarioModule {}
