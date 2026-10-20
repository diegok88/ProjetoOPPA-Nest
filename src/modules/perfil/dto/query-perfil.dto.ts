import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class QueryPerfilFilterDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Código não é do tipo Inteiro!' })
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
  @Transform(({ value }) =>
    value === undefined ? undefined : value === 'true' || value === true,
  )
  @IsBoolean({ message: 'Status não é do tipo Boolean!' })
  status?: boolean;

  @IsOptional()
  @IsString({ message: 'O campo deve ser do tipo string.' })
  campos?: string;
}
