import { OmitType, PartialType, PickType } from '@nestjs/mapped-types';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { CreateUsuarioDto } from './create-usuario.dto';

export class UpdateUsuarioDto extends PartialType(
  OmitType(CreateUsuarioDto, ['cracha', 'senha', 'pin', 'registradoPorId']),
) {
  @IsOptional()
  @IsBoolean({ message: 'Status não é do tipo Boolean!' })
  status?: boolean;
}

export class UpdatePasswordUsuarioDto extends OmitType(CreateUsuarioDto, [
  'cracha',
  'dataAdmissao',
  'dataDesligamento',
  'dataNascimento',
  'escala',
  'nome',
  'perfilId',
  'pin',
  'senha',
  'turno',
]) {
  @IsString({ message: 'Nome não é do tipo String.' })
  @MinLength(6, { message: 'Senha deve conter no minimo 6 caracteres.' })
  @IsNotEmpty({ message: 'Senha é um campo obrigatório.' })
  @Matches(/^[a-zA-Z0-9]+$/, {
    message: 'Senha deve conter apenas letras e números',
  })
  atualSenha!: string;

  @IsString({ message: 'Nome não é do tipo String.' })
  @MinLength(6, { message: 'Senha deve conter no minimo 6 caracteres.' })
  @IsNotEmpty({ message: 'Senha é um campo obrigatório.' })
  @Matches(/^[a-zA-Z0-9]+$/, {
    message: 'Senha deve conter apenas letras e números',
  })
  novaSenha!: string;
}

export class UpdatePinUsuarioDto extends OmitType(CreateUsuarioDto, [
  'cracha',
  'dataAdmissao',
  'dataDesligamento',
  'dataNascimento',
  'escala',
  'nome',
  'perfilId',
  'pin',
  'senha',
  'turno',
]) {
  @IsString({ message: 'Nome não é do tipo String.' })
  @MaxLength(4, { message: 'Pin deve conter no minimo 4 caracteres.' })
  @IsNotEmpty({ message: 'Pin é um campo obrigatório.' })
  @Matches(/^\d+$/, {
    message: 'O pin deve conter apenas números',
  })
  atualPin!: string;

  @IsString({ message: 'Nome não é do tipo String.' })
  @MaxLength(4, { message: 'Pin deve conter no minimo 4 caracteres.' })
  @IsNotEmpty({ message: 'Pin é um campo obrigatório.' })
  @Matches(/^\d+$/, {
    message: 'O pin deve conter apenas números',
  })
  novoPin!: string;
}

export class UpdateUsuarioDeactiveDto extends PickType(CreateUsuarioDto, [
  'empresaId',
  'registradoPorId',
]) {}
