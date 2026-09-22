import { PartialType } from '@nestjs/mapped-types';
import { CreateAtivoDto } from './create-ativo.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class QueryAtivoFilterDto extends PartialType(CreateAtivoDto) {
  @IsOptional()
  @IsBoolean({ message: 'Status não é do tipo Boolean!' })
  status?: boolean;
}