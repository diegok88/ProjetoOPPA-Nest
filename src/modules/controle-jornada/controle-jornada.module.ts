import { forwardRef, Module } from '@nestjs/common';
import { ControleJornadaService } from './controle-jornada.service';
import { ControleJornadaController } from './controle-jornada.controller';
import { PerfilModule } from '../perfil/perfil.module';
import { GeradorTurnoModule } from '../gerador-turno/gerador-turno.module';
import { UsuarioModule } from '../usuario/usuario.module';
import { AlocacaoModule } from '../alocacao/alocacao.module';

@Module({
  imports: [
    forwardRef(() => PerfilModule),
    UsuarioModule,
    AlocacaoModule,
    GeradorTurnoModule,
  ],
  controllers: [ControleJornadaController],
  providers: [ControleJornadaService],
  exports: [ControleJornadaService],
})
export class ControleJornadaModule {}
