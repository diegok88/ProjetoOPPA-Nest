import { forwardRef, Module } from '@nestjs/common';
import { ContadorCrachaModule } from '../contador-cracha/contador-cracha.module';
import { PerfilModule } from '../perfil/perfil.module';
import { UsuarioController } from './usuario.controller';
import { UsuarioService } from './usuario.service';
import { CompetenciaSetorialOrquestradorModule } from '@/services-orchestrator/competencia-setorial/competencia-setorial-orquestrador.module';
import { GenerateTokenModule } from '@/auth/jwt-generate-token/jwt-generate-token.module';
import { GestorOrquestradorModule } from '@/services-orchestrator/gestor/gestor-orquestrador.module';

@Module({
  imports: [
    forwardRef(() => PerfilModule),
    GenerateTokenModule,
    ContadorCrachaModule,
    CompetenciaSetorialOrquestradorModule,
    GestorOrquestradorModule,
  ],
  controllers: [UsuarioController],
  providers: [UsuarioService],
  exports: [UsuarioService],
})
export class UsuarioModule {}
