
import { TipoEscala, TipoTurno } from '@/generated/prisma/enums';
import { formatUppercase } from '@/utils/format-uppercase.util';
import { IsEnum, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class UpdateDataUsuarioDto {
  @IsOptional()
  @IsUUID('all', { message: 'Perfil id inválido.' })
  @IsNotEmpty({ message: 'Perfil é um campo obrigatório.' })
  perfilId?: string;

  @IsOptional()
  @IsEnum(TipoTurno, { message: 'Turno não pertence ao enum TipoTurno.' })
  @IsNotEmpty({ message: 'Turno é um campo obrigatório.' })
  @formatUppercase()
  turno?: TipoTurno;

  @IsOptional()
  @IsEnum(TipoEscala, { message: 'Escala não pertence ao enum TipoEscala.' })
  @IsNotEmpty({ message: 'Escala é um campo obrigatório.' })
  @formatUppercase()
  escala?: TipoEscala;
}
