import { PartialType } from '@nestjs/mapped-types';
import { CreatePenalidadeDto } from './create-penalidade.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class QueryPenalidadeFilterDto extends PartialType(CreatePenalidadeDto) {
  @IsOptional()
  @IsBoolean({ message: 'Status não é do tipo Boolean!' })
  status?: boolean;
}
