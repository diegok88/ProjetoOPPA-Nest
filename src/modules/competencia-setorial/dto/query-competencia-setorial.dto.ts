import { TipoTurno } from '@/generated/prisma/enums';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class QueryCompetenciaSetorialFilterDto {
  @IsOptional()
  @IsNumber({}, { message: 'Código não é do tipo Number.' })
  @IsInt({ message: 'Código não é um número inteiro.' })
  codigo?: number;

  @IsOptional()
  @IsUUID('all', { message: 'Colaborador id inválido.' })
  colaboradorId?: string;

  @IsOptional()
  @IsUUID('all', { message: 'Gestor id inválido.' })
  gestorId?: string;

  @IsOptional()
  @IsUUID('all', { message: 'Setor id inválido.' })
  setorId?: string;

  @IsOptional()
  @IsEnum(TipoTurno, { message: 'Turno não pertence ao enum TipoTurno.' })
  turno?: TipoTurno;

  @IsOptional()
  @IsBoolean({ message: 'O status não é do tipo Boolean.' })
  status?: boolean;

  @IsOptional()
  @IsString({ message: 'Campos não é do tipo String.' })
  campos?: string;

  @IsOptional()
  @IsString({ message: 'Include não é do tipo String.' })
  incluir?: string;
}
