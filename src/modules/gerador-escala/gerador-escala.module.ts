import { forwardRef, Module } from '@nestjs/common';
import { GeradorEscalaService } from './gerador-escala.service';
import { GeradorEscalaController } from './gerador-escala.controller';
import { PerfilModule } from '../perfil/perfil.module';

@Module({
  imports: [forwardRef(() => PerfilModule)],
  controllers: [GeradorEscalaController],
  providers: [GeradorEscalaService],
  exports: [GeradorEscalaService],
})
export class GeradorEscalaModule {}
