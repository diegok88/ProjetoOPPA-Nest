import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Matches,
  MinLength,
} from 'class-validator';
import { TipoTurno, TipoEscala } from '@/generated/prisma/enums';
import { Transform } from 'class-transformer';

export class QueryUsuarioFilterDto {
  @IsOptional()
  @IsNumber({}, { message: 'Crachá não é do tipo Number' })
  cracha?: number;

  @IsOptional()
  @IsString({ message: 'Nome não é do tipo String.' })
  @Length(10, 100, {
    message:
      'Nome deve conter no minimo 10 caracteres e no maximo 100 caracteres.',
  })
  @Matches(/^[a-zA-ZÀ-ÿ\s]+$/, {
    message:
      'O nome deve conter letras maisculas e minusculas, sem numeros e caracteres especiais.',
  })
  @Transform(({ value }) => value.toUpperCase())
  nome?: string;

  @IsOptional()
  @IsString({ message: 'Nome não é do tipo String.' })
  @MinLength(6, { message: 'Senha deve conter no minimo 6 caracteres.' })
  @Matches(/^[a-zA-Z0-9]+$/, {
    message: 'Senha deve conter apenas letras e números',
  })
  senha?: string;

  @IsOptional()
  @IsString({ message: 'Nome não é do tipo String.' })
  @MinLength(4, { message: 'Pin deve conter no minimo 4 caracteres.' })
  @Matches(/^\d+$/, {
    message: 'O cnpj deve conter apenas números',
  })
  pin?: string;

  @IsOptional()
  @IsDate({ message: 'Data de nascimento não é do tipo Date.' })
  dataNascimento?: Date;

  @IsOptional()
  @IsDate({ message: 'Data de admissão não é do tipo Date.' })
  dataAdmissao?: Date;

  @IsOptional()
  @IsDate({ message: 'Data de desligamento não é do tipo Date.' })
  dataDesligamento?: Date;

  @IsOptional()
  @IsUUID('all', { message: 'Perfil id inválido.' })
  perfilId?: string;

  @IsOptional()
  @IsEnum(TipoTurno, { message: 'Turno não pertence ao enum TipoTurno.' })
  @Transform(({ value }) => value.toUpperCase())
  turno?: TipoTurno;

  @IsOptional()
  @IsEnum(TipoEscala, { message: 'Escala não pertence ao enum TipoEscala.' })
  @Transform(({ value }) => value.toUpperCase())
  escala?: TipoEscala;

  @IsOptional()
  @IsUUID('all', { message: 'Empresa id inválido.' })
  empresaId?: string;

  @IsOptional()
  @IsBoolean({ message: 'O status não é do tipo Boolean.' })
  status?: boolean;

  @IsOptional()
  @IsString({ message: 'Campos não é do tipo String.' })
  campos?: string;
}

export class QueryBagdeEnterpriceDto {
  @IsNumber({}, { message: 'Crachá não é do tipo Number' })
  @IsNotEmpty({ message: 'Empresa é um campo obrigatório.' })
  cracha?: number;

  @IsUUID('all', { message: 'Empresa id inválido.' })
  @IsNotEmpty({ message: 'Empresa é um campo obrigatório.' })
  empresaId?: string;
}
