import { PartialType } from '@nestjs/mapped-types';
import { CreateCompetenciaOperacionalDto } from './create-competencia-operacional.dto';

export class UpdateCompetenciaOperacionalDto extends PartialType(CreateCompetenciaOperacionalDto) {}
