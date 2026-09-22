import { PartialType } from '@nestjs/mapped-types';
import { CreateControleJornadaDto } from './create-controle-jornada.dto';

export class UpdateControleJornadaDto extends PartialType(CreateControleJornadaDto) {}
