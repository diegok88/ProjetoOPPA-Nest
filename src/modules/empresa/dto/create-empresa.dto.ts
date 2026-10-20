import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
  MaxLength,
} from 'class-validator';

const toUpperIfString = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.toUpperCase() : value;

export class CreateEmpresaDto {
  @IsString({ message: 'O CNPJ deve ser um texto.' })
  @IsNotEmpty({ message: 'O CNPJ é um campo obrigatório.' })
  @Length(14, 14, {
    message: (args) =>
      `O CNPJ deve conter exatamente ${args.constraints[0]} caracteres.`,
  })
  @Matches(/^\d+$/, { message: 'O CNPJ deve conter apenas números.' })
  cnpj!: string;

  @IsString({ message: 'A razão social deve ser um texto.' })
  @IsNotEmpty({ message: 'A razão social é um campo obrigatório.' })
  @Length(10, 100, {
    message: (args) =>
      `A razão social deve conter entre ${args.constraints[0]} e ${args.constraints[1]} caracteres.`,
  })
  @Transform(toUpperIfString)
  razaoSocial!: string;

  @IsString({ message: 'O nome fantasia deve ser um texto.' })
  @IsNotEmpty({ message: 'O nome fantasia é um campo obrigatório.' })
  @Length(10, 100, {
    message: (args) =>
      `O nome fantasia deve conter entre ${args.constraints[0]} e ${args.constraints[1]} caracteres.`,
  })
  @Transform(toUpperIfString)
  nomeFantasia!: string;

  @IsString({ message: 'O contato deve ser um texto.' })
  @IsNotEmpty({ message: 'O contato é um campo obrigatório.' })
  @Length(11, 11, {
    message: (args) =>
      `O contato deve conter exatamente ${args.constraints[0]} caracteres.`,
  })
  @Matches(/^\d+$/, { message: 'O contato deve conter apenas números.' })
  contato!: string;

  @IsString({ message: 'O e-mail deve ser um texto.' })
  @IsNotEmpty({ message: 'O e-mail é um campo obrigatório.' })
  @IsEmail(
    {},
    {
      message:
        'O e-mail informado é inválido. Informe um e-mail no formato nome@dominio.com.',
    },
  )
  email!: string;

  @IsString({ message: 'A rua deve ser um texto.' })
  @IsNotEmpty({ message: 'A rua é um campo obrigatório.' })
  @Length(5, 50, {
    message: (args) =>
      `A rua deve conter entre ${args.constraints[0]} e ${args.constraints[1]} caracteres.`,
  })
  @Transform(toUpperIfString)
  rua!: string;

  @IsString({ message: 'O número deve ser um texto.' })
  @IsNotEmpty({ message: 'O número é um campo obrigatório.' })
  @MaxLength(20, {
    message: (args) =>
      `O número deve conter no máximo ${args.constraints[0]} caracteres.`,
  })
  numero!: string;

  @IsString({ message: 'O bairro deve ser um texto.' })
  @IsNotEmpty({ message: 'O bairro é um campo obrigatório.' })
  @Length(5, 50, {
    message: (args) =>
      `O bairro deve conter entre ${args.constraints[0]} e ${args.constraints[1]} caracteres.`,
  })
  @Transform(toUpperIfString)
  bairro!: string;

  @IsString({ message: 'A cidade deve ser um texto.' })
  @IsNotEmpty({ message: 'A cidade é um campo obrigatório.' })
  @Length(5, 50, {
    message: (args) =>
      `A cidade deve conter entre ${args.constraints[0]} e ${args.constraints[1]} caracteres.`,
  })
  @Transform(toUpperIfString)
  cidade!: string;

  @IsString({ message: 'O estado deve ser um texto.' })
  @IsNotEmpty({ message: 'O estado é um campo obrigatório.' })
  @Length(2, 2, {
    message: (args) =>
      `O estado deve conter exatamente ${args.constraints[0]} caracteres (sigla UF).`,
  })
  @Transform(toUpperIfString)
  estado!: string;

  @IsString({ message: 'O CEP deve ser um texto.' })
  @IsNotEmpty({ message: 'O CEP é um campo obrigatório.' })
  @Length(8, 8, {
    message: (args) =>
      `O CEP deve conter exatamente ${args.constraints[0]} caracteres.`,
  })
  @Matches(/^\d+$/, { message: 'O CEP deve conter apenas números.' })
  cep!: string;
}
