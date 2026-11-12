import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class QueryTagAtivoFilterDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Código não é do tipo Inteiro!' })
  @IsNumber({}, { message: 'Código não é do tipo Number!' })
  codigo?: number;

  @IsOptional()
  @IsString({ message: 'Descrição não é do tipo String!' })
  descricao?: string;

  @IsOptional()
  @IsUUID(undefined, { message: 'AtivoId não é do tipo UUID!' })
  ativoId?: string;

  /* Filtra pela empresa do ATIVO vinculado (TagAtivo não tem empresaId) */
  @IsOptional()
  @IsUUID(undefined, { message: 'EmpresaId não é do tipo UUID!' })
  empresaId?: string;

  @IsOptional()
  @Transform(({ value }) =>
    value === undefined ? undefined : value === 'true' || value === true,
  )
  @IsBoolean({ message: 'Status não é do tipo Boolean!' })
  status?: boolean;
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

export class QueryTagAtivoSetoresDto {
  @IsNotEmpty({ message: 'O setor id é um campo obrigatório.' })
  @IsUUID(undefined, { message: 'Setor Id não é do tipo UUID!' })
  setorId!: string;
}
