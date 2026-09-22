import { PartialType } from '@nestjs/mapped-types';
import { CreateFluxoOcorrenciaDto } from './create-fluxo-ocorrencia.dto';
import { IsDate, IsInt, IsNotEmpty, IsOptional, Min } from 'class-validator';

export class UpdateFluxoOcorrenciaDto extends PartialType(
  CreateFluxoOcorrenciaDto,
) {}
