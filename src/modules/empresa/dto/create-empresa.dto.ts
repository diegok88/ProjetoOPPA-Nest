import { formatUppercase } from '@/functions/dtos.function';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreateEmpresaDto {
  @IsString({ message: 'O cnpj não é do tipo String.' })
  @IsNotEmpty({ message: 'O cnpj é um campo obrigatório.' })
  @Length(14, 14, { message: 'O cnpj deve conter apenas 14 caracteres.' })
  @Matches(/^\d+$/, {
    message: 'O cnpj deve conter apenas números',
  })
  cnpj!: string;

  @IsString({ message: 'A razao social não é do tipo String.' })
  @IsNotEmpty({ message: 'A razao social é um campo obrigatório.' })
  @Length(10, 100, {
    message:
      'A razao social deve conter no minimo 10 caracteres e no maximo 100 caracteres.',
  })
  @formatUppercase()
  razaoSocial!: string;

  @IsString({ message: 'O nome fantasia não é do tipo String.' })
  @IsNotEmpty({ message: 'O nome fantasia é um campo obrigatório.' })
  @Length(10, 100, {
    message:
      'O nome fantasia deve conter no minimo 10 caracteres e no maximo 100 caracteres.',
  })
  @formatUppercase()
  nomeFantasia!: string;

  @IsString({ message: 'O contato não é do tipo String.' })
  @IsNotEmpty({ message: 'O contato é um campo obrigatório.' })
  @Length(11, 11, { message: 'O contato deve conter apenas 11 caracteres.' })
  @Matches(/^\d+$/, {
    message: 'O contato deve conter apenas números',
  })
  contato!: string;

  @IsEmail({}, { message: 'O dado não é um email' })
  @IsNotEmpty({ message: 'O email é um campo obrigatório.' })
  email!: string;

  @IsString({ message: 'A rua não é do tipo String.' })
  @IsNotEmpty({ message: 'A rua é um campo obrigatório.' })
  @Length(5, 50, {
    message:
      'A rua deve conter no minimo 5 caracteres e no maximo 50 caracteres.',
  })
  @formatUppercase()
  rua!: string;

  @IsString({ message: 'O numero não é do tipo String.' })
  @IsNotEmpty({ message: 'O numero é um campo obrigatório.' })
  @MaxLength(20, { message: 'O numero deve conter no maximo 20 caracteres.' })
  numero!: string;

  @IsString({ message: 'O bairro não é do tipo String.' })
  @IsNotEmpty({ message: 'O bairro é um campo obrigatório.' })
  @Length(10, 50, {
    message:
      'O bairro deve conter no minimo 10 caracteres e no maximo 50 caracteres.',
  })
  @formatUppercase()
  bairro!: string;

  @IsString({ message: 'A cidade não é do tipo String.' })
  @IsNotEmpty({ message: 'A cidade é um campo obrigatório.' })
  @Length(5, 50, {
    message:
      'A cidade deve conter no minimo 5 caracteres e no maximo 50 caracteres.',
  })
  @formatUppercase()
  cidade!: string;

  @IsString({ message: 'O estado não é do tipo String.' })
  @IsNotEmpty({ message: 'O estado é um campo obrigatório.' })
  @Length(2, 2, {
    message: 'O estado deve conter apenas a abreviação sendo 2 caracteres.',
  })
  @formatUppercase()
  estado!: string;

  @IsString({ message: 'O cep não é do tipo String.' })
  @IsNotEmpty({ message: 'O cep é um campo obrigatórioo.' })
  @Length(8, 8, { message: 'O cep  conter apenas 8 caracteres.' })
  @Matches(/^\d+$/, {
    message: 'O cep deve conter apenas números',
  })
  cep!: string;
}
