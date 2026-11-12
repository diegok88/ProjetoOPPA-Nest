import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { TipoEstadoJornada, TipoJornada } from '@/generated/prisma/enums';
import { fimDoDiaBrasilia } from '@/utils/data-brasilia.util';
import {
  CONSULTAS,
  DESVIOS,
  type RecorteControleJornada,
  type ConsultaControleJornada,
} from '@/constants/query-controle-jornada.const';

export class QueryControleJornadaFilterDto {
  /* Condições de acordo com o model */
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Código deve ser um número inteiro.' })
  @Min(1, { message: 'Código deve ser maior que zero.' })
  codigo?: number;

  @IsOptional()
  @IsUUID('all', { message: 'Usuário id inválido.' })
  usuarioId?: string;

  @IsOptional()
  @IsUUID('all', { message: 'Tag ativo id inválido.' })
  tagAtivoId?: string;

  @IsOptional()
  @IsEnum(TipoJornada, {
    message: 'Tipo de jornada não pertence ao enum TipoJornada.',
  })
  tipoJornada?: TipoJornada;

  @IsOptional()
  @IsEnum(TipoEstadoJornada, {
    message: 'Estado de jornada não pertence ao enum TipoEstadoJornada.',
  })
  estadoJornada?: TipoEstadoJornada;

  @IsOptional()
  @Transform(({ value }) => fimDoDiaBrasilia(value))
  @IsDate({ message: 'DataRegistro não está em formato de data válido!' })
  dataRegistro?: Date;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  @IsBoolean({ message: 'Status não é do tipo Boolean!' })
  status?: boolean;

  /* Condições de retorno dos dados */
  @IsOptional()
  @IsIn(Object.keys(CONSULTAS), { message: 'Consulta não reconhecida.' })
  consulta?: ConsultaControleJornada;

  @IsOptional()
  @IsIn(Object.keys(DESVIOS), { message: 'Desvio não reconhecida.' })
  desvios?: RecorteControleJornada;

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
