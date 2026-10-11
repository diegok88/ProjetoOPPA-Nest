import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';

export class QueryTagAtivoFilterDto {
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
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean({ message: 'Status não é do tipo Boolean!' })
  status?: boolean;

  @IsOptional()
  @IsString({ message: 'Campos não é do tipo String.' })
  campos?: string;

  @IsOptional()
  @IsString({ message: 'Include não é do tipo String.' })
  incluir?: string;
}
