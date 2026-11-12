import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { CONSULTAS, DESVIOS } from '@/constants/query-controle-jornada.const';
import {
  fimDoDiaBrasilia,
  inicioDoDiaBrasilia,
} from '@/utils/data-brasilia.util';
import { CondicaoOcorrencia, TipoOcorrencia } from '@/generated/prisma/enums';
import type {
  ConsultaOcorrencia,
  RecorteOcorrencia,
} from '@/constants/query-ocorrencia.const';

export class QueryOcorrenciaFilterDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Código deve ser um número inteiro.' })
  @Min(1, { message: 'Código deve ser maior que zero.' })
  codigo?: number;

  @IsOptional()
  @IsUUID('all', { message: 'Falha id inválida.' })
  estadoAtivoId?: string;

  @IsOptional()
  @IsUUID('all', { message: 'Falha id inválida.' })
  tagAtivoId?: string;

  @IsOptional()
  @IsUUID('all', { message: 'Falha id inválida.' })
  falhaId?: string;

  @IsOptional()
  @IsUUID('all', { message: 'Solução id inválida.' })
  solucaoId?: string;

  @IsOptional()
  @IsEnum(TipoOcorrencia, {
    message: 'TipoOcorrencia não pertence ao enum TipoOcorrencia',
  })
  tipoOcorrencia?: TipoOcorrencia;

  @IsOptional()
  @IsEnum(CondicaoOcorrencia, {
    message: 'CondicaoOcorrencia não pertence ao enum CondicaoOcorrencia',
  })
  condicaoOcorrencia?: CondicaoOcorrencia;

  @IsOptional()
  @IsUUID('all', { message: 'Usuário id inválido.' })
  solucionadoId?: string;

  @IsOptional()
  @Transform(({ value }) => inicioDoDiaBrasilia(value)) 
  @IsDate({ message: 'DataInicial não está em formato de data válido!' })
  dataInicial?: Date;

  @IsOptional()
  @Transform(({ value }) => fimDoDiaBrasilia(value))
  @IsDate({
    message: 'DataFalhaRegistrado não está em formato de data válido!',
  })
  dataFalhaRegistrado?: Date;

  @IsOptional()
  @Transform(({ value }) => fimDoDiaBrasilia(value))
  @IsDate({ message: 'DataFinal não está em formato de data válido!' })
  dataFinal?: Date;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  @IsBoolean({ message: 'StatusFalha não é do tipo Boolean!' })
  statusFalha?: boolean;

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
  consulta?: ConsultaOcorrencia;

  @IsOptional()
  @IsIn(Object.keys(DESVIOS), { message: 'Desvio não reconhecida.' })
  desvios?: RecorteOcorrencia;

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
