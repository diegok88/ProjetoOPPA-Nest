import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  Matches,
  Min,
  MinLength,
} from 'class-validator';

export class LoginDto {
  @Type(() => Number)
  @IsNumber({}, { message: 'Crachá não é do tipo Number!' })
  @Min(0, { message: 'Crachá não deve ser um valor negativo' })
  cracha!: number;

  @IsString({ message: 'Nome não é do tipo String!' })
  @MinLength(6, { message: 'Senha deve conter no minimo 6 caracteres.' })
  @IsNotEmpty({ message: 'Senha é um campo obrigatório.' })
  @Matches(/^[a-zA-Z0-9]+$/, {
    message: 'Senha deve conter apenas letras e números',
  })
  senha!: string;

  @Type(() => Number)
  @IsNumber({}, { message: 'Empresa código não é do tipo Number!.' })
  @IsNotEmpty({ message: 'Empresa é um campo obrigatório.' })
  codEmpresa!: number;
}
