import { IsString, IsNotEmpty, Matches, MaxLength } from 'class-validator';

export class UpdatePinUsuarioDto {
  @IsString({ message: 'Nome não é do tipo String.' })
  @MaxLength(4, { message: 'Pin deve conter no minimo 4 caracteres.' })
  @IsNotEmpty({ message: 'Pin é um campo obrigatório.' })
  @Matches(/^\d+$/, {
    message: 'O pin deve conter apenas números',
  })
  atualPin!: string;

  @IsString({ message: 'Nome não é do tipo String.' })
  @MaxLength(4, { message: 'Pin deve conter no minimo 4 caracteres.' })
  @IsNotEmpty({ message: 'Pin é um campo obrigatório.' })
  @Matches(/^\d+$/, {
    message: 'O pin deve conter apenas números',
  })
  novoPin!: string;
}
