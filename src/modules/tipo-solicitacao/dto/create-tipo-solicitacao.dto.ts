import {
  IsString,
  IsNotEmpty,
  IsBoolean,
  Length,
  Matches,
} from 'class-validator';

export class CreateTipoSolicitacaoDto {
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
}
