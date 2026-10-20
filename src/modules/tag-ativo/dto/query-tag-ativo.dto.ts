import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
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

  @IsOptional()
  @IsString({ message: 'Campos não é do tipo String.' })
  campos?: string;

  @IsOptional()
  @IsString({ message: 'Include não é do tipo String.' })
  incluir?: string;
}
