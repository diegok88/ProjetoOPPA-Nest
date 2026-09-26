import { TipoEscala, TipoTurno } from '@/generated/prisma/enums';
import { OmitType, PickType } from '@nestjs/mapped-types';
import { Transform } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsString,
  IsUUID,
  Length,
  Matches,
  MinLength,
} from 'class-validator';

export class CreateUsuarioDto {
  @IsString({ message: 'Nome não é do tipo String.' })
  @IsNotEmpty({ message: 'Nome é um campo obrigatório.' })
  @Length(10, 100, {
    message:
      'Nome deve conter no minimo 10 caracteres e no maximo 100 caracteres.',
  })
  @Matches(/^[a-zA-ZÀ-ÿ\s]+$/, {
    message:
      'O nome deve conter letras maisculas e minusculas, sem numeros e caracteres especiais.',
  })
  @Transform(({ value }) => value.toUpperCase())
  nome!: string;

  @IsDate({ message: 'Data de nascimento não é do tipo Date.' })
  @IsNotEmpty({ message: 'Data de nascimento é um campo obrigatório.' })
  dataNascimento!: Date;

  @IsDate({ message: 'Data de admissão não é do tipo Date.' })
  @IsNotEmpty({ message: 'Data de admissão é um campo obrigatório.' })
  dataAdmissao!: Date;

  @IsUUID('all', { message: 'Perfil id inválido.' })
  @IsNotEmpty({ message: 'Perfil é um campo obrigatório.' })
  perfilId!: string;

  @IsEnum(TipoTurno, { message: 'Turno não pertence ao enum TipoTurno.' })
  @IsNotEmpty({ message: 'Turno é um campo obrigatório.' })
  @Transform(({ value }) => value.toUpperCase())
  turno!: TipoTurno;

  @IsEnum(TipoEscala, { message: 'Escala não pertence ao enum TipoEscala.' })
  @IsNotEmpty({ message: 'Escala é um campo obrigatório.' })
  @Transform(({ value }) => value.toUpperCase())
  escala!: TipoEscala;

  @IsUUID('all', { message: 'Empresa id inválido.' })
  @IsNotEmpty({ message: 'Empresa é um campo obrigatório.' })
  empresaId?: string;
}

export class CreateUsuarioMaster extends PickType(CreateUsuarioDto, ['nome']) {
  @IsString({ message: 'Senha não é do tipo String.' })
  @MinLength(6, { message: 'Senha deve conter no minimo 6 caracteres.' })
  @IsNotEmpty({ message: 'Senha é um campo obrigatório.' })
  @Matches(/^[a-zA-Z0-9]+$/, {
    message: 'Senha deve conter apenas letras e números',
  })
  senha!: string;

  @IsString({ message: 'Pin não é do tipo String.' })
  @Length(4, 4, { message: 'Pin deve conter no minimo 4 caracteres.' })
  @IsNotEmpty({ message: 'Pin é um campo obrigatório.' })
  @Matches(/^\d+$/, {
    message: 'Pin deve conter apenas números',
  })
  pin!: string;
}
