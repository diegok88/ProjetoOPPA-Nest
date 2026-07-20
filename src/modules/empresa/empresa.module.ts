import { Module } from '@nestjs/common';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { ContadorCrachaService } from '../contador-cracha/contador-cracha.service';
import { EmpresaController } from './empresa.controller';
import { EmpresaService } from './empresa.service';

@Module({
  controllers: [EmpresaController],
  providers: [EmpresaService, ContadorCrachaService, AuditoriaService],
})
export class EmpresaModule {}
