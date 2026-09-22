import { PartialType } from '@nestjs/mapped-types';
import { CreateSolucoesDto } from './create-solucoes.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class QuerySolucoesFilterDto extends PartialType(CreateSolucoesDto) {
  @IsOptional()
  @IsBoolean({ message: 'Status não é do tipo Boolean!' })
  status?: boolean;
}
