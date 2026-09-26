import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class CreatePerfilDto {
  @IsString({ message: 'A descrição deve ser do tipo string.' })
  @IsNotEmpty({ message: 'A descrição não deve estar vazio.' })
  @Length(5, 100, {
    message:
      'A descrição deve conter no minimo 5 caracteres e no maximo 100 caracteres.',
  })
  @Matches(/^[a-zA-ZÀ-ÿ\s]+$/, {
    message:
      'A descrição deve conter letras maisculas e minusculas, sem numeros e caracteres especiais.',
  })
  @Transform(({ value }) => value.toUpperCase())
  descricao!: string;

  @IsString({ message: 'O nivel deve ser do tipo string.' })
  @IsNotEmpty({ message: 'O nivel não deve estar vazio.' })
  @Matches(/^[a-zA-Z0-9\s]+$/, {
    message: 'O nivel deve conter apenas letras e números',
  })
  @Transform(({ value }) => value.toUpperCase())
  nivel!: string;
}
