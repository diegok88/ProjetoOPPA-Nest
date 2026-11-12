import {
  type ConsultaFalhas,
  CONSULTAS,
  DESVIOS,
  type RecorteFalhas,
} from '@/constants/query-falha.const';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Matches,
  Max,
  Min,
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

export class QueryFalhaFilterDto {
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
  @IsIn(Object.keys(CONSULTAS), { message: 'Consulta não reconhecida.' })
  consulta?: ConsultaFalhas;

  @IsOptional()
  @IsIn(Object.keys(DESVIOS), { message: 'Desvio não reconhecida.' })
  desvios?: RecorteFalhas;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Página deve ser um número inteiro.' })
  @Min(1, { message: 'Página deve ser maior que zero.' })
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Tamanho deve ser um número inteiro.' })
  @Min(1)
  @Max(100, { message: 'Tamanho máximo é 100.' })
  size?: number = 10;
}
