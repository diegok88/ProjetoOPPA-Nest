import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class QueryCompetenciaOperacionalFilterDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Código não é do tipo Inteiro!' })
  @IsNumber({}, { message: 'Código não é do tipo Number!' })
  codigo?: number;

  @IsOptional()
  @IsUUID('all', { message: 'Operador id inválido.' })
  operadorId?: string;

  @IsOptional()
  @IsUUID('all', { message: 'Gestor id inválido.' })
  gestorId?: string;

  @IsOptional()
  @IsUUID('all', { message: 'Ativo id inválido.' })
  ativoId?: string;

  @IsOptional()
  @Transform(({ value }) =>
    value === undefined ? undefined : value === 'true' || value === true,
  )
  @IsBoolean({ message: 'Status não é do tipo Boolean!' })
  status?: boolean;

  @IsOptional()
  @Transform(({ value }) =>
    value === 'true' ? true : value === 'false' ? false : value,
  )
  @IsBoolean({ message: 'Gestor não é do tipo Boolean!' })
  gestor?: boolean;

  @IsOptional()
  @IsString({ message: 'Campos não é do tipo String!' })
  campos?: string;

  @IsOptional()
  @IsString({ message: 'Incluir não é do tipo String!' })
  incluir?: string;

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

export class QueryCompetenciaOperacionalCounterDto {
  @IsOptional()
  @Transform(({ value }) =>
    value === 'true' ? true : value === 'false' ? false : value,
  )
  @IsBoolean({ message: 'Gestor não é do tipo Boolean!' })
  gestor?: boolean;
}

export class QueryCompetenciaOperacionalOperadorDto {
  @IsOptional()
  @IsUUID('all', { message: 'Operador id inválido.' })
  operadorId?: string;
}
