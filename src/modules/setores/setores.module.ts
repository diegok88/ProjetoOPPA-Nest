import { Module } from '@nestjs/common';
import { SetoresService } from './setores.service';
import { SetoresController } from './setores.controller';
import { PerfilModule } from '../perfil/perfil.module';

@Module({
  imports: [PerfilModule],
  controllers: [SetoresController],
  providers: [SetoresService],
  exports: [SetoresService],
})
export class SetoresModule {}
