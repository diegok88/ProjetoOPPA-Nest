import { forwardRef, Module } from '@nestjs/common';
import { TipoSolicitacaoService } from './tipo-solicitacao.service';
import { TipoSolicitacaoController } from './tipo-solicitacao.controller';
import { PerfilModule } from '../perfil/perfil.module';

@Module({
  imports: [forwardRef(() => PerfilModule)],
  controllers: [TipoSolicitacaoController],
  providers: [TipoSolicitacaoService],
})
export class TipoSolicitacaoModule {}
