import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsInt,
  IsUUID,
  Min,
  Length,
  Matches,
} from 'class-validator';

export class CreateAtivoDto {
  @IsString({ message: 'A descrição não é do tipo String.' })
  @IsNotEmpty({ message: 'A descrição é um campo obrigatório.' })
  @Length(5, 100, {
    message:
      'A descrição deve conter no minimo 10 caracteres e no maximo 100 caracteres.',
  })
  @Matches(/^[a-zA-ZÀ-ÿ\s]+$/, {
    message:
      'A descrição deve conter letras maisculas e minusculas, sem numeros e caracteres especiais.',
  })
  descricao!: string;

  @IsString({ message: 'O modelo não é do tipo String.' })
  @IsNotEmpty({ message: 'O modelo é um campo obrigatório.' })
  @Length(5, 100, {
    message:
      'O modelo deve conter no minimo 10 caracteres e no maximo 100 caracteres.',
  })
  @Matches(/^[a-zA-Z0-9]+$/, {
    message: 'O modelo deve conter apenas letras e números',
  })
  modelo!: string;

  @IsString({ message: 'O fabricante não é do tipo String.' })
  @IsNotEmpty({ message: 'O fabricante é um campo obrigatório.' })
  @Length(5, 100, {
    message:
      'O fabricante deve conter no minimo 10 caracteres e no maximo 100 caracteres.',
  })
  @Matches(/^[a-zA-Z0-9]+$/, {
    message: 'O fabricante deve conter apenas letras e números',
  })
  fabricante!: string;

  @IsNumber({}, { message: 'O ano não é do tipo Number.' })
  @IsInt({ message: 'O ano deve ser um número inteiro.' })
  @Min(1950, { message: 'O ano não pode ser anterior a 1950.' })
  @IsNotEmpty({ message: 'O ano é um campo obrigatório.' })
  ano!: number;

  @IsUUID('all', { message: 'Setor id inválido.' })
  @IsNotEmpty({ message: 'O setor é um campo obrigatório.' })
  setorId!: string;
}
