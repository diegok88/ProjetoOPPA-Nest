import { Transform, Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
  Matches,
  Min,
  MinLength,
} from 'class-validator';

export class LoginColaboradorDto {
  @Type(() => Number)
  @IsNumber({}, { message: 'Crachá deve ser um número.' })
  @IsNotEmpty({ message: 'Crachá é obrigatório.' })
  @Min(0, { message: 'Crachá não pode ser negativo.' })
  cracha!: number;

  @IsString({ message: 'Senha deve ser um texto.' })
  @IsNotEmpty({ message: 'Senha é obrigatória.' })
  @MinLength(6, { message: 'Senha deve ter no mínimo 6 caracteres.' })
  senha!: string;

  @Type(() => Number)
  @IsNumber({}, { message: 'Código da empresa deve ser um número.' })
  @IsNotEmpty({ message: 'Empresa é obrigatória.' })
  codEmpresa!: number;
}

export class LoginTagAtivoDto {
  @IsString({ message: 'Código deve ser um texto.' })
  @IsNotEmpty({ message: 'Código é obrigatório.' })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  codigo!: string;

  @IsString({ message: 'Senha deve ser um texto.' })
  @IsNotEmpty({ message: 'Senha é obrigatória.' })
  @MinLength(6, { message: 'Senha deve ter no mínimo 6 caracteres.' })
  senha!: string;

  @Type(() => Number)
  @IsNumber({}, { message: 'Código da empresa deve ser um número.' })
  @IsNotEmpty({ message: 'Empresa é obrigatória.' })
  codEmpresa!: number;
}

export class AutenticarAcaoDto {
  @Type(() => Number)
  @IsNumber({}, { message: 'Crachá deve ser um número.' })
  @IsNotEmpty({ message: 'Crachá é obrigatório.' })
  @Min(0, { message: 'Crachá não pode ser negativo.' })
  cracha!: number;

  @IsString({ message: 'Senha deve ser um texto.' })
  @IsNotEmpty({ message: 'Senha é obrigatória.' })
  @MinLength(4, { message: 'Senha deve ter no mínimo 4 caracteres.' })
  @Matches(/^\d+$/, {
    message: 'Pin deve conter apenas números',
  })
  pin!: string;

  @IsNotEmpty({ message: 'EmpresaId é obrigatório.' })
  @IsUUID('all', { message: 'EmpresaId id inválido.' })
  empresaId!: string;
}
