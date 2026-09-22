import { IsUUID, IsString, IsNotEmpty, Length, Matches } from 'class-validator';

export class CreateSolucoesDto {
  @IsUUID('all', { message: 'Falha id inválida.' })
  @IsNotEmpty({ message: 'A falha é um campo obrigatório.' })
  falhaId!: string;

  @IsUUID('all', { message: 'Direcionamento id inválido.' })
  @IsNotEmpty({ message: 'O direcionamento é um campo obrigatório.' })
  direcionamentoId!: string;

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
