import { Transform } from 'class-transformer';
import { IsUUID, IsString, IsNotEmpty, Length, Matches } from 'class-validator';

export class CreateFalhaDto {
  @IsString({ message: 'A código não é do tipo String.' })
  @IsNotEmpty({ message: 'O código é um campo obrigatório.' })
  @Transform(({ value }) => value.toUpperCase())
  codigo!: string;

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
  @Transform(({ value }) => value.toUpperCase())
  descricao!: string;

  @IsUUID('all', { message: 'Ativo id inválido.' })
  @IsNotEmpty({ message: 'O ativo é um campo obrigatório.' })
  ativoId!: string;

  @IsUUID('all', { message: 'Direcionamento id inválido.' })
  @IsNotEmpty({ message: 'O direcionamento é um campo obrigatório.' })
  direcionamentoId!: string;
}
