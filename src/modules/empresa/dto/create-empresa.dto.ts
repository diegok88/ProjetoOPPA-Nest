import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreateEmpresaDto {
  @IsString({ message: 'Dado não é do tipo String.' })
  @IsNotEmpty({ message: 'Campo não pode estar vazio.' })
  @Length(14, 14, { message: 'Deve conter apenas 14 caracteres.' })
  @Matches(/^\d+$/, {
    message: 'Dado deve conter apenas números',
  })
  cnpj!: string;

  @IsString({ message: 'Dado não é do tipo String.' })
  @IsNotEmpty({ message: 'Campo não pode estar vazio.' })
  @Length(10, 100, {
    message:
      'Dado deve conter no minimo 10 caracteres e no maximo 100 caracteres.',
  })
  razaoSocial!: string;

  @IsString({ message: 'Dado não é do tipo String.' })
  @IsNotEmpty({ message: 'Campo não pode estar vazio.' })
  @Length(10, 100, {
    message:
      'Dado deve conter no minimo 10 caracteres e no maximo 100 caracteres.',
  })
  nomeFantasia!: string;

  @IsString({ message: 'Dado não é do tipo String.' })
  @IsNotEmpty({ message: 'Campo não pode estar vazio.' })
  @Length(11, 11, { message: 'Deve conter apenas 11 caracteres.' })
  @Matches(/^\d+$/, {
    message: 'Dado deve conter apenas números',
  })
  contato!: string;

  @IsEmail({}, { message: 'Dado não é um email' })
  @IsNotEmpty({ message: 'Campo não pode estar vazio.' })
  email!: string;

  @IsString({ message: 'Dado não é do tipo String.' })
  @IsNotEmpty({ message: 'Campo não pode estar vazio.' })
  @Length(10, 50, {
    message:
      'Dado deve conter no minimo 10 caracteres e no maximo 50 caracteres.',
  })
  rua!: string;

  @IsString({ message: 'Dado não é do tipo String.' })
  @IsNotEmpty({ message: 'Campo não pode estar vazio.' })
  @MaxLength(20, { message: 'Dado deve conter no maximo 20 caracteres.' })
  numero!: string;

  @IsString({ message: 'Dado não é do tipo String.' })
  @IsNotEmpty({ message: 'Campo não pode estar vazio.' })
  @Length(10, 50, {
    message:
      'Dado deve conter no minimo 10 caracteres e no maximo 50 caracteres.',
  })
  bairro!: string;

  @IsString({ message: 'Dado não é do tipo String.' })
  @IsNotEmpty({ message: 'Campo não pode estar vazio.' })
  @Length(10, 50, {
    message:
      'Dado deve conter no minimo 10 caracteres e no maximo 50 caracteres.',
  })
  cidade!: string;

  @IsString({ message: 'Dado não é do tipo String.' })
  @IsNotEmpty({ message: 'Campo não pode estar vazio.' })
  @Length(2, 2, {
    message: 'Dado deve conter apenas a abreviação sendo 2 caracteres.',
  })
  estado!: string;

  @IsString({ message: 'Dado não é do tipo String.' })
  @IsNotEmpty({ message: 'Campo não pode estar vazio.' })
  @Length(8, 8, { message: 'Deve conter apenas 8 caracteres.' })
  @Matches(/^\d+$/, {
    message: 'Dado deve conter apenas números',
  })
  cep!: string;
}
