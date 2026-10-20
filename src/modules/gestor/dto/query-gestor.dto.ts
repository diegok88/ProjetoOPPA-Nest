import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';

export class QueryGestorFilterDto {
  @IsOptional()
  @IsUUID('all', { message: 'Colaborador id não é do tipo UUID!' })
  colaboradorId?: string;

  @IsOptional()
  @IsUUID('all', { message: 'Gestor id não é do tipo UUID!' })
  gestorId?: string;

  @IsOptional()
  @Transform(({ value }) =>
    value === 'true' ? true : value === 'false' ? false : value,
  )
  @IsBoolean({ message: 'Status não é do tipo Boolean!' })
  status?: boolean;

  @IsOptional()
  @IsString({ message: 'Campos não é do tipo String.' })
  campos?: string;

  @IsOptional()
  @IsString({ message: 'Include não é do tipo String.' })
  incluir?: string;

  @IsOptional()
  @Transform(({ value }) =>
    value === 'true' ? true : value === 'false' ? false : value,
  )
  @IsBoolean({ message: 'Gestor não é do tipo Boolean!' })
  gestor?: boolean;
}
