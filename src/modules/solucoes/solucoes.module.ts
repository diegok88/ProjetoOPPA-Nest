import { forwardRef, Module } from '@nestjs/common';
import { SolucoesService } from './solucoes.service';
import { SolucoesController } from './solucoes.controller';
import { PerfilModule } from '../perfil/perfil.module';

@Module({
  imports: [forwardRef(() => PerfilModule)],
  controllers: [SolucoesController],
  providers: [SolucoesService],
})
export class SolucoesModule {}
