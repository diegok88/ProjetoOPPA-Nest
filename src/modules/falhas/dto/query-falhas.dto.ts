import { PartialType } from '@nestjs/mapped-types';
import { CreateFalhaDto } from './create-falha.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class QueryFalhasFilterDto extends PartialType(CreateFalhaDto) {
  @IsOptional()
  @IsBoolean({ message: 'Status não é do tipo Boolean!' })
  status?: boolean;
}
