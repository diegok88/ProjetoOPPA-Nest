import { IsBoolean, IsOptional, IsUUID } from 'class-validator';

export class QueryGestorFilterDto {
  @IsOptional()
  @IsUUID('all', { message: 'Colaborador id não é do tipo UUID!' })
  colaboradorId?: string;

  @IsOptional()
  @IsUUID('all', { message: 'Gestor id não é do tipo UUID!' })
  gestorId?: string;

  @IsOptional()
  @IsBoolean({ message: 'Status não é do tipo Boolean!' })
  status?: boolean;
}
