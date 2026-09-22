import { PartialType } from '@nestjs/mapped-types';
import { CreateControleJornadaDto } from './create-controle-jornada.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class QueryControleJornadaFilterDto extends PartialType(
  CreateControleJornadaDto,
) {
  @IsOptional()
  @IsBoolean({ message: 'O status não é do tipo Boolean.' })
  status!: boolean;
}
