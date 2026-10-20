import { forwardRef, Module } from '@nestjs/common';
import { CompetenciaOperacionalService } from './competencia-operacional.service';
import { CompetenciaOperacionalController } from './competencia-operacional.controller';
import { PerfilModule } from '../perfil/perfil.module';
import { AtivoModule } from '../ativo/ativo.module';

@Module({
  imports: [forwardRef(() => PerfilModule), AtivoModule],
  controllers: [CompetenciaOperacionalController],
  providers: [CompetenciaOperacionalService],
  exports: [CompetenciaOperacionalService],
})
export class CompetenciaOperacionalModule {}
