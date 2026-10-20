import { SituacaoDispensa, TipoDispensa } from '@/generated/prisma/enums';
import {
  fimDoDiaBrasilia,
  inicioDoDiaBrasilia,
} from '@/utils/data-brasilia.util';
import { Transform, Type } from 'class-transformer';
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
} from 'class-validator';

export class QueryDispensaFilterDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Código não é do tipo Inteiro!' })
  @IsNumber({}, { message: 'Código não é do tipo Number!' })
  codigo?: number;

  @IsOptional()
  @IsUUID(undefined, { message: 'UsuárioId não é do tipo UUID!' })
  colaboradorId?: string;

  @IsOptional()
  @IsUUID(undefined, { message: 'GestorId não é do tipo UUID!' })
  gestorId?: string;

  @IsOptional()
  @IsEnum(TipoDispensa, { message: 'TipoDispensa não é um valor válido!' })
  tipoDispensa?: TipoDispensa;

  @IsOptional()
  @IsEnum(SituacaoDispensa, {
    message: 'SituacaoDispensa não é um valor válido!',
  })
  situacaoDispensa?: SituacaoDispensa;

  @IsOptional()
  @Transform(({ value }) => inicioDoDiaBrasilia(value))
  @IsDate({ message: 'DataInicial não está em formato de data válido!' })
  dataInicial?: Date;

  @IsOptional()
  @Transform(({ value }) => fimDoDiaBrasilia(value))
  @IsDate({ message: 'DataFinal não está em formato de data válido!' })
  dataFinal?: Date;

  @IsOptional()
  @Transform(({ value }) =>
    value === 'true' ? true : value === 'false' ? false : value,
  )
  @IsBoolean({ message: 'Status não é do tipo Boolean!' })
  status?: boolean;

  @IsOptional()
  @IsString({ message: 'Campos não é do tipo String!' })
  campos?: string;

  @IsOptional()
  @IsString({ message: 'Incluir não é do tipo String!' })
  incluir?: string;

  @IsOptional()
  @Transform(({ value }) =>
    value === 'true' ? true : value === 'false' ? false : value,
  )
  @IsBoolean({ message: 'Gestor não é do tipo Boolean!' })
  gestor?: boolean;
}

export class QueryDispensaCounterDto {
  @IsOptional()
  @Transform(({ value }) =>
    value === 'true' ? true : value === 'false' ? false : value,
  )
  @IsBoolean({ message: 'Gestor não é do tipo Boolean!' })
  gestor?: boolean;
}

export class QueryDispensaDateFilterDto {
  @IsNotEmpty({ message: 'DataInicial é um campo obrigatório.' })
  @Transform(({ value }) => inicioDoDiaBrasilia(value))
  @IsDate({ message: 'DataInicial não está em formato de data válido!' })
  dataInicial!: Date;

  @IsNotEmpty({ message: 'DataFinal é um campo obrigatório.' })
  @Transform(({ value }) => fimDoDiaBrasilia(value))
  @IsDate({ message: 'DataFinal não está em formato de data válido!' })
  dataFinal!: Date;
}
