import { PartialType } from '@nestjs/mapped-types';
import { CreateCompetenciaOperacionalDto } from './create-competencia-operacional.dto';
import { IsBoolean, IsOptional, IsUUID } from 'class-validator';

export class QueryCompetenciaOperacionalFilterDto extends PartialType(
  CreateCompetenciaOperacionalDto,
) {
  @IsOptional()
  @IsUUID('all', { message: 'Gestor id inválido.' })
  gestorId?: string;

  @IsOptional()
  @IsBoolean({ message: 'Status não é do tipo Boolean!' })
  status?: boolean;
}
