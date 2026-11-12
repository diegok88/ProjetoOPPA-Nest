import { PartialType } from '@nestjs/mapped-types';
import { CreateEstadoAtivoDto } from './create-estado-ativo.dto';
import { IsOptional, IsUUID } from 'class-validator';

export class UpdateEstadoAtivoDto extends PartialType(CreateEstadoAtivoDto) {
  @IsUUID('all', { message: 'Id inválido.' })
  id!: string;
}
