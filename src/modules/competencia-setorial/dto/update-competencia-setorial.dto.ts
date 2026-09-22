import { PartialType } from '@nestjs/mapped-types';
import { CreateCompetenciaSetorialDto } from './create-competencia-setorial.dto';

export class UpdateCompetenciaSetorialDto extends PartialType(CreateCompetenciaSetorialDto) {}
