import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import {
  fimDoDiaBrasilia,
  inicioDoDiaBrasilia,
} from '@/utils/data-brasilia.util';
import { StatusSolicitacao } from '@/generated/prisma/enums';
import {
  CAMPOS_ORDENACAO,
  type CampoOrdenacao,
  CONSULTAS,
  type ConsultaSolicitacoes,
  DESVIOS,
  ORDENS,
  type Ordem,
  type RecorteSolicitacoes,
} from '../entities/query-solicitacoes.const';

/* ==================== HELPERS DE TRANSFORM ==================== */
const paraBooleano = ({ value }: { value: unknown }): unknown => {
  if (value === 'true' || value === true) return true;
  if (value === 'false' || value === false) return false;
  return value;
};

const paraDataInicio = ({ value }: { value: unknown }): unknown => {
  if (value === undefined || value === null || value === '') return undefined;
  return inicioDoDiaBrasilia(value);
};

const paraDataFim = ({ value }: { value: unknown }): unknown => {
  if (value === undefined || value === null || value === '') return undefined;
  return fimDoDiaBrasilia(value);
};

/** Aceita array, string única e CSV: 'PENDENTE,ACEITA'. */
const paraLista = ({ value }: { value: unknown }): unknown => {
  if (value === undefined || value === null || value === '') return undefined;
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return value;
};

export class QuerySolicitacoesFilterDto {
  /* -------------------- Identificadores -------------------- */
  @IsOptional()
  @IsUUID('all', { message: 'Solicitante id inválido.' })
  solicitanteId?: string;

  @IsOptional()
  @IsUUID('all', { message: 'Solicitado id inválido.' })
  solicitadoId?: string;

  @IsOptional()
  @IsUUID('all', { message: 'TagAtivo id inválido.' })
  tagAtivoId?: string;

  @IsOptional()
  @IsUUID('all', { message: 'TipoSolicitacao id inválido.' })
  tipoSolicitacaoId?: string;

  /* -------------------- Situação -------------------- */
  @IsOptional()
  @IsEnum(StatusSolicitacao, {
    message: 'Situacao não pertence ao enum StatusSolicitacao',
  })
  situacao?: StatusSolicitacao;

  /** Uma ou mais situações (aceita CSV). */
  @IsOptional()
  @Transform(paraLista)
  @IsArray({ message: 'Situacoes deve ser uma lista.' })
  @IsEnum(StatusSolicitacao, {
    each: true,
    message: 'Situacoes contém valor fora do enum StatusSolicitacao',
  })
  situacoes?: StatusSolicitacao[];

  /* -------------------- Período -------------------- */
  /** Limite INFERIOR de dataEnvio (início do dia em Brasília). */
  @IsOptional()
  @Transform(paraDataInicio)
  @IsDate({ message: 'DataEnvio não está em formato de data válido!' })
  dataEnvio?: Date;

  /** Limite SUPERIOR de dataEnvio (fim do dia em Brasília). */
  @IsOptional()
  @Transform(paraDataFim)
  @IsDate({ message: 'DataEnvioAte não está em formato de data válido!' })
  dataEnvioAte?: Date;

  @IsOptional()
  @Transform(paraDataFim)
  @IsDate({ message: 'DataVisualizacao não está em formato de data válido!' })
  dataVisualizacao?: Date;

  @IsOptional()
  @Transform(paraDataFim)
  @IsDate({ message: 'DataResposta não está em formato de data válido!' })
  dataResposta?: Date;

  /* -------------------- Flags -------------------- */
  @IsOptional()
  @Transform(paraBooleano)
  @IsBoolean({ message: 'ApenasNaoVisualizadas não é do tipo Boolean!' })
  apenasNaoVisualizadas?: boolean;

  /** Somente registros já respondidos. */
  @IsOptional()
  @Transform(paraBooleano)
  @IsBoolean({ message: 'ApenasComResposta não é do tipo Boolean!' })
  apenasComResposta?: boolean;

  @IsOptional()
  @Transform(paraBooleano)
  @IsBoolean({ message: 'Status não é do tipo Boolean!' })
  status?: boolean;

  /* -------------------- Busca textual -------------------- */
  @IsOptional()
  @IsString({ message: 'Busca deve ser texto.' })
  @MaxLength(120, { message: 'Busca deve ter no máximo 120 caracteres.' })
  busca?: string;

  /* -------------------- Caixa -------------------- */
  @IsOptional()
  @IsIn(['recebidas', 'enviadas', 'todas'], {
    message: 'Caixa não reconhecida.',
  })
  caixa?: 'recebidas' | 'enviadas' | 'todas';

  /* -------------------- Ordenação -------------------- */
  @IsOptional()
  @IsIn(CAMPOS_ORDENACAO, {
    message: `OrdenarPor deve ser um de: ${CAMPOS_ORDENACAO.join(', ')}.`,
  })
  ordenarPor?: CampoOrdenacao;

  @IsOptional()
  @IsIn(ORDENS, { message: 'Ordem deve ser asc ou desc.' })
  ordem?: Ordem;

  /* -------------------- Consulta e recorte -------------------- */
  @IsOptional()
  @IsIn(Object.keys(CONSULTAS), { message: 'Consulta não reconhecida.' })
  consulta?: ConsultaSolicitacoes;

  @IsOptional()
  @IsIn(Object.keys(DESVIOS), { message: 'Desvio não reconhecido.' })
  desvios?: RecorteSolicitacoes;

  /* -------------------- Paginação -------------------- */
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

/*

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
import {
  fimDoDiaBrasilia,
  inicioDoDiaBrasilia,
} from '@/utils/data-brasilia.util';
import { StatusSolicitacao } from '@/generated/prisma/enums';
import {
  CONSULTAS,
  type ConsultaSolicitacoes,
  DESVIOS,
  type RecorteSolicitacoes,
} from '../entities/query-solicitacoes.const';

export class QuerySolicitacoesFilterDto {
  @IsOptional()
  @IsUUID('all', { message: 'Solicitante id inválido.' })
  solicitanteId?: string;

  @IsOptional()
  @IsUUID('all', { message: 'Solicitado id inválido.' })
  solicitadoId?: string;

  @IsOptional()
  @IsUUID('all', { message: 'TagAtivo id inválido.' })
  tagAtivoId?: string;

  @IsOptional()
  @IsUUID('all', { message: 'TipoSolicitacao id inválido.' })
  tipoSolicitacaoId?: string;

  @IsOptional()
  @IsEnum(StatusSolicitacao, {
    message: 'Situacao não pertence ao enum StatusSolicitacao',
  })
  situacao?: StatusSolicitacao;

  @IsOptional()
  @Transform(({ value }) => inicioDoDiaBrasilia(value))
  @IsDate({ message: 'DataEnvio não está em formato de data válido!' })
  dataEnvio?: Date;

  @IsOptional()
  @Transform(({ value }) => fimDoDiaBrasilia(value))
  @IsDate({ message: 'DataVisualizacao não está em formato de data válido!' })
  dataVisualizacao?: Date;

  @IsOptional()
  @Transform(({ value }) => fimDoDiaBrasilia(value))
  @IsDate({ message: 'DataResposta não está em formato de data válido!' })
  dataResposta?: Date;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  @IsBoolean({ message: 'ApenasNaoVisualizadas não é do tipo Boolean!' })
  apenasNaoVisualizadas?: boolean;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  @IsBoolean({ message: 'Status não é do tipo Boolean!' })
  status?: boolean;

  @IsOptional()
  @IsIn(['recebidas', 'enviadas', 'todas'], {
    message: 'Caixa não reconhecida.',
  })
  caixa?: 'recebidas' | 'enviadas' | 'todas';

  @IsOptional()
  @IsIn(Object.keys(CONSULTAS), { message: 'Consulta não reconhecida.' })
  consulta?: ConsultaSolicitacoes;

  @IsOptional()
  @IsIn(Object.keys(DESVIOS), { message: 'Desvio não reconhecido.' })
  desvios?: RecorteSolicitacoes;

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

*/
