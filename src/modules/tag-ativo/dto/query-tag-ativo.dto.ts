import { PartialType } from '@nestjs/mapped-types';
import { CreateTagAtivoDto } from './create-tag-ativo.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class QueryTagAtivoFilterDto extends PartialType(CreateTagAtivoDto) {
  @IsOptional()
  @IsBoolean({ message: 'Status não é do tipo Boolean!' })
  status?: boolean;
}
