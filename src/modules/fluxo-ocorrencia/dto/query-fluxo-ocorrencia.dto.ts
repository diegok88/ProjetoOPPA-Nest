import { PartialType } from '@nestjs/mapped-types';
import { CreateFluxoOcorrenciaDto } from './create-fluxo-ocorrencia.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class QueryFluxoOcorrenciaFilterDto extends PartialType(
  CreateFluxoOcorrenciaDto,
) {
  @IsOptional()
  @IsBoolean({ message: 'Status não é do tipo Boolean!' })
  status?: boolean;
}
