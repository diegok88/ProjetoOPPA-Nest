import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Length,
} from 'class-validator';
import { SituacaoPenalidade, TipoPenalidade } from '@/generated/prisma/enums';
import { Transform, Type } from 'class-transformer';
import {
  fimDoDiaBrasilia,
  inicioDoDiaBrasilia,
} from '@/utils/data-brasilia.util';

export class QueryPenalidadeFilterDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Código não é do tipo Inteiro!' })
  @IsNumber({}, { message: 'Código não é do tipo Number!' })
  codigo?: number;

  @IsOptional()
  @IsUUID('all', { message: 'Usuário id inválido.' })
  colaboradorId!: string;

  @IsOptional()
  @IsUUID('all', { message: 'Gestor id inválido.' })
  gestorId!: string;

  @IsOptional()
  @IsEnum(TipoPenalidade, {
    message: 'Tipo penalidade não pertence ao enum TipoPenalidade.',
  })
  tipoPenalidade!: TipoPenalidade;

  @IsOptional()
  @IsEnum(SituacaoPenalidade, {
    message: 'Situação da penalidade não pertence ao enum SituaçãoPenalidade.',
  })
  situacaoPenalidade!: SituacaoPenalidade;

  @IsOptional()
  @Transform(({ value }) => inicioDoDiaBrasilia(value))
  @IsDate({ message: 'DataInicial não está em formato de data válido!' })
  dataInicial?: Date;

  @IsOptional()
  @Transform(({ value }) => fimDoDiaBrasilia(value))
  @IsDate({ message: 'DataFinal não está em formato de data válido!' })
  dataFinal?: Date;

  @IsOptional()
  @IsString({ message: 'A justificativa não é do tipo String.' })
  @Length(10, 500, {
    message:
      'A justificativa deve conter no minimo 10 caracteres e no maximo 500 caracteres.',
  })
  justificativa?: string;

  @IsOptional()
  @Transform(({ value }) =>
    value === 'true' ? true : value === 'false' ? false : value,
  )
  @IsBoolean({ message: 'Status não é do tipo Boolean!' })
  status?: boolean;

  @IsOptional()
  @IsString({ message: 'O campos não é do tipo String.' })
  campos?: string;

  @IsOptional()
  @IsString({ message: 'O incluir não é do tipo String.' })
  incluir?: string;

  @IsOptional()
  @Transform(({ value }) =>
    value === 'true' ? true : value === 'false' ? false : value,
  )
  @IsBoolean({ message: 'Gestor não é do tipo Boolean!' })
  gestor?: boolean;
}

export class QueryPenalidadeCounterDto {
  @IsOptional()
  @Transform(({ value }) =>
    value === 'true' ? true : value === 'false' ? false : value,
  )
  @IsBoolean({ message: 'Gestor não é do tipo Boolean!' })
  gestor?: boolean;
}

export class QueryPenalidadeDateFilterDto {
  @IsNotEmpty({ message: 'DataInicial é um campo obrigatório.' })
  @Transform(({ value }) => inicioDoDiaBrasilia(value))
  @IsDate({ message: 'DataInicial não está em formato de data válido!' })
  dataInicial!: Date;

  @IsNotEmpty({ message: 'DataFinal é um campo obrigatório.' })
  @Transform(({ value }) => fimDoDiaBrasilia(value))
  @IsDate({ message: 'DataFinal não está em formato de data válido!' })
  dataFinal!: Date;
}
