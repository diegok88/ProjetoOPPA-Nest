import { AuthModule } from '@/auth/auth.module';
import { GenerateTokenModule } from '@/auth/jwt-generate-token/jwt-generate-token.module';
import { PerfilModule } from '@/modules/perfil/perfil.module';
import { forwardRef, Module } from '@nestjs/common';
import { EstadoAtivoGateway } from './estado-ativo.gateway';
import { EstadoAtivoService } from './estado-ativo.service';
import { GeradorTurnoModule } from '@/modules/gerador-turno/gerador-turno.module';
import { AlocacaoModule } from '@/modules/alocacao/alocacao.module';
import { TagAtivoModule } from '@/modules/tag-ativo/tag-ativo.module';
import { OcorrenciaModule } from '@/modules/ocorrencia/ocorrencia.module';

@Module({
  imports: [
    forwardRef(() => PerfilModule),
    GenerateTokenModule,
    AuthModule,
    TagAtivoModule,
    GeradorTurnoModule,
    AlocacaoModule,
    OcorrenciaModule,
  ],
  providers: [EstadoAtivoGateway, EstadoAtivoService],
  exports: [EstadoAtivoService],
})
export class EstadoAtivoModule {}
