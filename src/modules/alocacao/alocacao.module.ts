import { forwardRef, Module } from '@nestjs/common';
import { AlocacaoService } from './alocacao.service';
import { AlocacaoController } from './alocacao.controller';
import { PerfilModule } from '../perfil/perfil.module';

@Module({
  imports: [forwardRef(() => PerfilModule)],
  controllers: [AlocacaoController],
  providers: [AlocacaoService],
})
export class AlocacaoModule {}
