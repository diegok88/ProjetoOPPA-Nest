import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsNumber, IsOptional } from 'class-validator';
import { CreateEmpresaDto } from './create-empresa.dto';

export class QueryEmpresaFilterDto extends PartialType(CreateEmpresaDto) {
  @IsOptional()
  @IsNumber({}, { message: 'Código não é do tipo Number!' })
  codigo?: number;

  @IsOptional()
  @IsBoolean({ message: 'Status não é do tipo Boolean!' })
  status?: boolean;
}
