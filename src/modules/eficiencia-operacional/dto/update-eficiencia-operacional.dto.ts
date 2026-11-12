import { PartialType } from '@nestjs/mapped-types';
import { CreateEficienciaOperacionalDto } from './create-eficiencia-operacional.dto';

export class UpdateEficienciaOperacionalDto extends PartialType(CreateEficienciaOperacionalDto) {}
