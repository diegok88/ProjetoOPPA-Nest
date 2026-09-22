import { PartialType } from '@nestjs/mapped-types';
import { CreatePerfilDto } from './create-perfil.dto';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class QueryPerfilFilterDto {
  @IsOptional()
  @IsNumber({}, { message: 'Código não é do tipo Number!' })
  codigo?: number;

  @IsOptional()
  @IsString({ message: 'A descrição deve ser do tipo string.' })
  @Transform(({ value }) => value.toUpperCase())
  descricao?: string;

  @IsOptional()
  @IsString({ message: 'O nivel deve ser do tipo string.' })
  @Transform(({ value }) => value.toUpperCase())
  nivel?: string;

  @IsOptional()
  @IsBoolean({ message: 'Status não é do tipo Boolean!' })
  status?: boolean;
}
