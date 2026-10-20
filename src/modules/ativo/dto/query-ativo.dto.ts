import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class QueryAtivoFilterDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Código não é do tipo Inteiro!' })
  @IsNumber({}, { message: 'Código não é do tipo Number!' })
  codigo?: number;

  @IsOptional()
  @IsString({ message: 'A descrição não é do tipo String.' })
  descricao?: string;

  @IsOptional()
  @IsString({ message: 'O modelo não é do tipo String.' })
  modelo?: string;

  @IsOptional()
  @IsString({ message: 'O fabricante não é do tipo String.' })
  fabricante?: string;

  @IsOptional()
  @IsNumber({}, { message: 'O ano não é do tipo Number.' })
  @IsInt({ message: 'O ano deve ser um número inteiro.' })
  @Min(1950, { message: 'O ano não pode ser anterior a 1950.' })
  ano?: number;

  @IsOptional()
  @IsUUID('all', { message: 'O setor id informado não é um UUID válido!' })
  setorId?: string;

  @IsOptional()
  @IsUUID('all', { message: 'O empresa id informado não é um UUID válido!' })
  empresaId?: string;

  @IsOptional()
  @Transform(({ value }) =>
    value === 'true' ? true : value === 'false' ? false : value,
  )
  @IsBoolean({ message: 'Status não é do tipo Boolean!' })
  status?: boolean;

  @IsOptional()
  @Transform(({ value }) =>
    value === 'true' ? true : value === 'false' ? false : value,
  )
  @IsBoolean({ message: 'Gestor não é do tipo Boolean!' })
  gestor?: boolean;

  @IsOptional()
  @IsString({ message: 'Campos não é do tipo String.' })
  campos?: string;

  @IsOptional()
  @IsString({ message: 'Include não é do tipo String.' })
  incluir?: string;
}
