import { forwardRef, Module } from '@nestjs/common';
import { AuthModule } from '@/auth/auth.module';
import { GenerateTokenModule } from '@/auth/jwt-generate-token/jwt-generate-token.module';
import { SolicitacoesGateway } from './solicitacoes.gateway';
import { SolicitacoesService } from './solicitacoes.service';
import { PerfilModule } from '@/modules/perfil/perfil.module';

@Module({
  imports: [forwardRef(() => PerfilModule), AuthModule, GenerateTokenModule],
  providers: [SolicitacoesGateway, SolicitacoesService],
  exports: [SolicitacoesService],
})
export class SolicitacoesModule {}
