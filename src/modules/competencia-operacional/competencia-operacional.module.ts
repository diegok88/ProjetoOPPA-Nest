import { forwardRef, Module } from '@nestjs/common';
import { CompetenciaOperacionalService } from './competencia-operacional.service';
import { CompetenciaOperacionalController } from './competencia-operacional.controller';
import { PerfilModule } from '../perfil/perfil.module';
import { AtivoModule } from '../ativo/ativo.module';
import { GeradorEscalaModule } from '../gerador-escala/gerador-escala.module';

@Module({
  imports: [forwardRef(() => PerfilModule), AtivoModule, GeradorEscalaModule],
  controllers: [CompetenciaOperacionalController],
  providers: [CompetenciaOperacionalService],
  exports: [CompetenciaOperacionalService],
})
export class CompetenciaOperacionalModule {}
