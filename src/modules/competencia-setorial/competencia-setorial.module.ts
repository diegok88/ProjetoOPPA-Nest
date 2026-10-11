import { forwardRef, Module } from '@nestjs/common';
import { CompetenciaSetorialService } from './competencia-setorial.service';
import { CompetenciaSetorialController } from './competencia-setorial.controller';
import { PerfilModule } from '../perfil/perfil.module';
import { GestorModule } from '../gestor/gestor.module';
import { UsuarioModule } from '../usuario/usuario.module';

@Module({
  imports: [forwardRef(() => PerfilModule), GestorModule, UsuarioModule],
  controllers: [CompetenciaSetorialController],
  providers: [CompetenciaSetorialService],
  exports: [CompetenciaSetorialService],
})
export class CompetenciaSetorialModule {}
