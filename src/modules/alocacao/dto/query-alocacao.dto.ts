import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import {
  CondicaoAlocacao,
  SituacaoAlocacao,
  TipoTurno,
} from '@/generated/prisma/enums';

export class QueryAlocacaoOperacionalFilterDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Código deve ser um número inteiro.' })
  @Min(1, { message: 'Código deve ser maior que zero.' })
  codigo?: number;

  @IsOptional()
  @IsUUID('all', { message: 'Operador id inválido.' })
  operadorId?: string;

  @IsOptional()
  @IsUUID('all', { message: 'Gestor id inválido.' })
  gestorId?: string;

  @IsOptional()
  @IsUUID('all', { message: 'Tag ativo id inválido.' })
  tagAtivoId?: string;

  @IsOptional()
  @IsUUID('all', { message: 'Setor id inválido.' })
  setorId?: string;

  @IsOptional()
  @IsEnum(TipoTurno, {
    message: 'Turno não pertence ao enum TipoTurno.',
  })
  turno?: TipoTurno;

  @IsOptional()
  @IsEnum(CondicaoAlocacao, {
    message: 'Condição não pertence ao enum CondicaoAlocacao.',
  })
  condicao?: CondicaoAlocacao;

  @IsOptional()
  @IsEnum(SituacaoAlocacao, {
    message: 'Situação não pertence ao enum SituacaoAlocacao.',
  })
  situacao?: SituacaoAlocacao;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  @IsBoolean({ message: 'Status não é do tipo Boolean!' })
  status?: boolean;

  @IsOptional()
  @Transform(({ value }) =>
    value === 'true' ? true : value === 'false' ? false : value,
  )
  @IsBoolean({ message: 'Gestor não é do tipo Boolean!' })
  gestor?: boolean;

  /* Parametro que garante o retorno dos campos selecionados */
  @IsOptional()
  @IsString({ message: 'Campos não é do tipo String.' })
  campos?: string;

  /* Parametro que garante o retorno do dados escolhidos */
  @IsOptional()
  @IsString({ message: 'Incluir não é do tipo String.' })
  incluir?: string;

  /* Parametro que garante a retirada, oerdenação de dados */
  @IsOptional()
  @IsString({ message: 'Eliminar não é do tipo String.' })
  decisao?: string;

  /* Parametro que garante a ordenação dinâmica */
  @IsOptional()
  @IsString({ message: 'Ordenação não é do tipo String.' })
  ordenacao?: string;

  /* Paginação da lista do filtro */
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

export class QueryQuantidadeAlocacaoOperadorDto {
  @IsOptional()
  @IsUUID('all', { message: 'Operador id inválido.' })
  operadorId?: string;

  @IsOptional()
  @IsEnum(SituacaoAlocacao, {
    message: 'Situação não pertence ao enum SituacaoAlocacao.',
  })
  situacao?: SituacaoAlocacao;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  @IsBoolean({ message: 'Status não é do tipo Boolean!' })
  status?: boolean;
}

export class QueryAlocacaoOperacionalCounterDto {
  @IsOptional()
  @Transform(({ value }) =>
    value === 'true' ? true : value === 'false' ? false : value,
  )
  @IsBoolean({ message: 'Gestor não é do tipo Boolean!' })
  gestor?: boolean;
}

export class QueryAlocacaoOperacionalSolicitacaoDto {
  @IsOptional()
  @IsUUID('all', { message: 'Gestor id inválido.' })
  gestorId?: string;

  @IsOptional()
  @IsUUID('all', { message: 'Tag ativo id inválido.' })
  tagAtivoId?: string;

  @IsOptional()
  @IsEnum(SituacaoAlocacao, {
    message: 'Situação não pertence ao enum SituacaoAlocacao.',
  })
  situacao?: SituacaoAlocacao;
}
