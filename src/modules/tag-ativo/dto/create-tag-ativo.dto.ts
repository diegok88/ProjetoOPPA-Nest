import {
  IsUUID,
  IsString,
  IsNotEmpty,
  IsBoolean,
  Length,
  Matches,
  MinLength,
} from 'class-validator';

export class CreateTagAtivoDto {
  @IsString({ message: 'A descrição não é do tipo String.' })
  @IsNotEmpty({ message: 'A descrição é um campo obrigatório.' })
  @Length(10, 100, {
    message:
      'A descrição deve conter no minimo 10 caracteres e no maximo 100 caracteres.',
  })
  @Matches(/^[a-zA-ZÀ-ÿ\s]+$/, {
    message:
      'A descrição deve conter letras maisculas e minusculas, sem numeros e caracteres especiais.',
  })
  descricao!: string;

  @IsUUID('all', { message: 'Ativo id inválido.' })
  @IsNotEmpty({ message: 'O ativo é um campo obrigatório.' })
  ativoId!: string;

  @IsString({ message: 'A senha não é do tipo String.' })
  @MinLength(6, { message: 'A senha deve conter no minimo 6 caracteres.' })
  @IsNotEmpty({ message: 'A senha é um campo obrigatório.' })
  @Matches(/^[a-zA-Z0-9]+$/, {
    message: 'A senha deve conter apenas letras e números',
  })
  senha!: string;
}
