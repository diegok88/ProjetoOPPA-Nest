import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsOptional, IsUUID } from 'class-validator';
import { CreateSetoresDto } from './create-setores.dto';

export class QuerySetoresDto extends PartialType(CreateSetoresDto) {
  @IsOptional()
  @IsUUID('all', { message: 'Empresa id inválido.' })
  empresaId?: string;

  @IsOptional()
  @IsBoolean({ message: 'Status não é do tipo Boolean!' })
  status?: boolean;
}
