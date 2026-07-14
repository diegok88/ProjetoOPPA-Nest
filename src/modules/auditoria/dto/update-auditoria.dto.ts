import { PartialType } from '@nestjs/mapped-types';
import { IsOptional } from 'class-validator';
import { CreateAuditoriaDto } from './create-auditoria.dto';

export class UpdateAuditoriaDto extends PartialType(CreateAuditoriaDto) {
  @IsOptional()
  antes: any;

  @IsOptional()
  depois: any;
}
