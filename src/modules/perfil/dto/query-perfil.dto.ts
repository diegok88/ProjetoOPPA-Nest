import { PartialType } from '@nestjs/mapped-types';
import { CreatePerfilDto } from './create-perfil.dto';
import { IsBoolean, IsNumber, IsOptional } from 'class-validator';

export class QueryPerfilFilterDto extends PartialType(CreatePerfilDto) {
  @IsOptional()
  @IsNumber({}, { message: 'Código não é do tipo Number!' })
  codigo?: number;

  @IsOptional()
  @IsBoolean({message: 'Status não é do tipo Boolean!'})
  status?: boolean;
}
