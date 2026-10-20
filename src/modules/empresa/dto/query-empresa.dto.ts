import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';

const toUpperIfString = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.toUpperCase() : value;

export class QueryEmpresaFilterDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({
    message: (args) => `O código "${args.value}" não é do tipo Inteiro!`,
  })
  codigo?: number;

  @IsOptional()
  @IsString({ message: 'O CNPJ não é do tipo String.' })
  @Length(1, 14, {
    message: (args) =>
      `O CNPJ deve conter entre ${args.constraints[0]} e ${args.constraints[1]} caracteres.`,
  })
  @Matches(/^\d+$/, { message: 'O CNPJ deve conter apenas números.' })
  cnpj?: string;

  @IsOptional()
  @IsString({ message: 'A razão social não é do tipo String.' })
  @Length(1, 100, {
    message: (args) =>
      `A razão social deve conter entre ${args.constraints[0]} e ${args.constraints[1]} caracteres.`,
  })
  @Transform(toUpperIfString)
  razaoSocial?: string;

  @IsOptional()
  @IsString({ message: 'O nome fantasia não é do tipo String.' })
  @Length(1, 100, {
    message: (args) =>
      `O nome fantasia deve conter entre ${args.constraints[0]} e ${args.constraints[1]} caracteres.`,
  })
  @Transform(toUpperIfString)
  nomeFantasia?: string;

  @IsOptional()
  @IsString({ message: 'O contato não é do tipo String.' })
  @Length(1, 11, {
    message: (args) =>
      `O contato deve conter entre ${args.constraints[0]} e ${args.constraints[1]} caracteres.`,
  })
  @Matches(/^\d+$/, { message: 'O contato deve conter apenas números.' })
  contato?: string;

  @IsOptional()
  @IsString({ message: 'O e-mail não é do tipo String.' })
  @IsEmail(
    {},
    {
      message:
        'O e-mail informado é inválido. Informe um e-mail no formato nome@dominio.com.',
    },
  )
  email?: string;

  @IsOptional()
  @IsString({ message: 'A rua não é do tipo String.' })
  @Length(1, 50, {
    message: (args) =>
      `A rua deve conter entre ${args.constraints[0]} e ${args.constraints[1]} caracteres.`,
  })
  @Transform(toUpperIfString)
  rua?: string;

  @IsOptional()
  @IsString({ message: 'O número não é do tipo String.' })
  @Length(1, 20, {
    message: (args) =>
      `O número deve conter entre ${args.constraints[0]} e ${args.constraints[1]} caracteres.`,
  })
  numero?: string;

  @IsOptional()
  @IsString({ message: 'O bairro não é do tipo String.' })
  @Length(1, 50, {
    message: (args) =>
      `O bairro deve conter entre ${args.constraints[0]} e ${args.constraints[1]} caracteres.`,
  })
  @Transform(toUpperIfString)
  bairro?: string;

  @IsOptional()
  @IsString({ message: 'A cidade não é do tipo String.' })
  @Length(1, 50, {
    message: (args) =>
      `A cidade deve conter entre ${args.constraints[0]} e ${args.constraints[1]} caracteres.`,
  })
  @Transform(toUpperIfString)
  cidade?: string;

  @IsOptional()
  @IsString({ message: 'O estado não é do tipo String.' })
  @Length(1, 2, {
    message: (args) =>
      `O estado deve conter entre ${args.constraints[0]} e ${args.constraints[1]} caracteres (UF).`,
  })
  @Transform(toUpperIfString)
  estado?: string;

  @IsOptional()
  @IsString({ message: 'O CEP não é do tipo String.' })
  @Length(1, 8, {
    message: (args) =>
      `O CEP deve conter entre ${args.constraints[0]} e ${args.constraints[1]} caracteres.`,
  })
  @Matches(/^\d+$/, { message: 'O CEP deve conter apenas números.' })
  cep?: string;

  @IsOptional()
  @Transform(({ value }) =>
    value === undefined ? undefined : value === 'true' || value === true,
  )
  @IsBoolean({
    message: (args) => `O status "${args.value}" não é do tipo Boolean!`,
  })
  status?: boolean;
}
