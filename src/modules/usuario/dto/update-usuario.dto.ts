import { OmitType, PartialType } from '@nestjs/mapped-types';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
  MinLength,
} from 'class-validator';
import { CreateUsuarioDto } from './create-usuario.dto';

export class UpdateUsuarioDto extends PartialType(
  OmitType(CreateUsuarioDto, ['cracha', 'senha', 'pin', 'registradoPorId']),
) {
  @IsOptional()
  @IsBoolean({ message: 'Status não é do tipo Boolean!' })
  status?: boolean;
}

export class UpdateUsuarioPasswordDto {
  @IsString({ message: 'Senha não é do tipo String.' })
  @MinLength(6, { message: 'Senha deve conter no minimo 6 caracteres.' })
  @IsNotEmpty({ message: 'Senha é um campo obrigatório.' })
  @Matches(/^[a-zA-Z0-9]+$/, {
    message: 'Senha deve conter apenas letras e números',
  })
  atual!: string;

  @IsString({ message: 'Senha não é do tipo String.' })
  @MinLength(6, { message: 'Senha deve conter no minimo 6 caracteres.' })
  @IsNotEmpty({ message: 'Senha é um campo obrigatório.' })
  @Matches(/^[a-zA-Z0-9]+$/, {
    message: 'Senha deve conter apenas letras e números',
  })
  novo!: string;
}

export class UpdateUsuarioPinDto {
  @IsString({ message: 'Pin não é do tipo String.' })
  @Length(4, 4, { message: 'Pin deve conter no minimo 4 caracteres.' })
  @IsNotEmpty({ message: 'Pin é um campo obrigatório.' })
  @Matches(/^\d+$/, {
    message: 'Pin deve conter apenas números',
  })
  atual!: string;

  @IsString({ message: 'Pin não é do tipo String.' })
  @Length(4, 4, { message: 'Pin deve conter no minimo 4 caracteres.' })
  @IsNotEmpty({ message: 'Pin é um campo obrigatório.' })
  @Matches(/^\d+$/, {
    message: 'Pin deve conter apenas números',
  })
  novo!: string;
}
