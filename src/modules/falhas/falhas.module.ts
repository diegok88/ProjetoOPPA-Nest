import { forwardRef, Module } from '@nestjs/common';
import { FalhasService } from './falhas.service';
import { FalhasController } from './falhas.controller';
import { PerfilModule } from '../perfil/perfil.module';

@Module({
  imports: [forwardRef(() => PerfilModule)],
  controllers: [FalhasController],
  providers: [FalhasService],
  exports: [FalhasService],
})
export class FalhasModule {}
