import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Matches,
} from 'class-validator';

export class QueryFalhasFilterDto {
  @IsOptional()
  @IsString({ message: 'A código não é do tipo String.' })
  codigo?: string;

  @IsOptional()
  @IsString({ message: 'A descrição não é do tipo String.' })
  @Length(10, 100, {
    message:
      'A descrição deve conter no minimo 10 caracteres e no maximo 100 caracteres.',
  })
  @Matches(/^[a-zA-ZÀ-ÿ\s]+$/, {
    message:
      'A descrição deve conter letras maisculas e minusculas, sem numeros e caracteres especiais.',
  })
  descricao?: string;

  @IsOptional()
  @IsUUID('all', { message: 'Ativo id inválido.' })
  ativoId?: string;

  @IsOptional()
  @IsUUID('all', { message: 'Ativo id inválido.' })
  empresaId?: string;

  @IsOptional()
  @IsUUID('all', { message: 'Direcionamento id inválido.' })
  direcionamentoId?: string;

  @IsOptional()
  @Transform(({ value }) =>
    value === 'true' ? true : value === 'false' ? false : value,
  )
  @IsBoolean({ message: 'Status não é do tipo Boolean!' })
  status?: boolean;

  @IsOptional()
  @IsString({ message: 'Campos não é do tipo String.' })
  campos?: string;

  @IsOptional()
  @IsString({ message: 'Include não é do tipo String.' })
  incluir?: string;
}
