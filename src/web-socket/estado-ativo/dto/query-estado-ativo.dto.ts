import { TipoEstadoAtivo } from '@/generated/prisma/enums';
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
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class QueryEstadoAtivoFilterDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Código deve ser um número inteiro.' })
  @Min(1, { message: 'Código deve ser maior que zero.' })
  codigo?: number;

  @IsOptional()
  @IsUUID('all', { message: 'Alocação id inválido.' })
  alocacaoId?: string;

  @IsOptional()
  @IsUUID('all', { message: 'Tag ativo id inválido.' })
  tagAtivoId?: string;

  /*Parametro não pertence a tabela */
  @IsOptional()
  @IsUUID('all', { message: 'Usuário id inválido.' })
  usuarioId?: string;

  /*Parametro não pertence a tabela */
  @IsOptional()
  @IsUUID('all', { message: 'Perfil id inválido.' })
  perfilId?: string;

  /*Parametro não pertence a tabela */
  @IsOptional()
  @IsUUID('all', { message: 'Setor id inválido.' })
  setorId?: string;

  @IsOptional()
  @IsEnum(TipoEstadoAtivo, {
    message: 'Tipo Estado Ativo não pertence ao enum TipoEstadoAtivo.',
  })
  tipoEstado?: TipoEstadoAtivo;

  @IsOptional()
  @Transform(({ value }) => inicioDoDiaBrasilia(value))
  @IsDate({ message: 'DataInicial não está em formato de data válido!' })
  dataInicial?: Date;

  @IsOptional()
  @Transform(({ value }) => fimDoDiaBrasilia(value))
  @IsDate({ message: 'DataFinal não está em formato de data válido!' })
  dataFinal?: Date;

  @IsOptional()
  @IsUUID('all', { message: 'GestorId não é do tipo UUID!' })
  gestorId?: string;

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

  /* Parametro que garante a retirada, ordenação, paginação de dados */
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
