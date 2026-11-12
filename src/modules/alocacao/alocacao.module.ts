import { forwardRef, Module } from '@nestjs/common';
import { AlocacaoService } from './alocacao.service';
import { AlocacaoController } from './alocacao.controller';
import { PerfilModule } from '../perfil/perfil.module';
import { TagAtivoModule } from '../tag-ativo/tag-ativo.module';

@Module({
  imports: [forwardRef(() => PerfilModule), TagAtivoModule],
  controllers: [AlocacaoController],
  providers: [AlocacaoService],
  exports: [AlocacaoService],
})
export class AlocacaoModule {}
