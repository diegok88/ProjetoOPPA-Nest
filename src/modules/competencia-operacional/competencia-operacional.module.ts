import { forwardRef, Module } from '@nestjs/common';
import { CompetenciaOperacionalService } from './competencia-operacional.service';
import { CompetenciaOperacionalController } from './competencia-operacional.controller';
import { PerfilModule } from '../perfil/perfil.module';

@Module({
  imports: [forwardRef(() => PerfilModule)],
  controllers: [CompetenciaOperacionalController],
  providers: [CompetenciaOperacionalService],
})
export class CompetenciaOperacionalModule {}
