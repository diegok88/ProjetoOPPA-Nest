import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
  Matches,
  Min,
  MinLength,
} from 'class-validator';

export class LoginDto {
  @IsNumber({}, { message: 'Crachá não é do tipo Number' })
  @Min(0, { message: 'Crachá não deve ser um valor negativo' })
  cracha!: number;

  @IsString({ message: 'Nome não é do tipo String.' })
  @MinLength(6, { message: 'Senha deve conter no minimo 6 caracteres.' })
  @IsNotEmpty({ message: 'Senha é um campo obrigatório.' })
  @Matches(/^[a-zA-Z0-9]+$/, {
    message: 'Senha deve conter apenas letras e números',
  })
  senha!: string;

  @IsUUID('all', { message: 'Empresa id inválido.' })
  @IsNotEmpty({ message: 'Empresa é um campo obrigatório.' })
  empresaId!: string;
}

export class LogoutDto {
  @IsUUID('all', { message: 'Empresa id inválido.' })
  @IsNotEmpty({ message: 'Empresa é um campo obrigatório.' })
  usuarioId!: string;

  @IsUUID('all', { message: 'Empresa id inválido.' })
  @IsNotEmpty({ message: 'Empresa é um campo obrigatório.' })
  empresaId!: string;
}
