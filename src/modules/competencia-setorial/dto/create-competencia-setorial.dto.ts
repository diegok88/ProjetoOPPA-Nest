import { TipoTurno } from '@/generated/prisma/enums';
import { IsUUID, IsNotEmpty, IsEnum } from 'class-validator';

export class CreateCompetenciaSetorialDto {
  @IsUUID('all', { message: 'Usuário id inválido.' })
  @IsNotEmpty({ message: 'Usuário é um campo obrigatório.' })
  usuarioId!: string;

  @IsUUID('all', { message: 'Setor id inválido.' })
  @IsNotEmpty({ message: 'Setor é um campo obrigatório.' })
  setorId!: string;

  @IsEnum(TipoTurno, { message: 'Turno não pertence ao enum TipoTurno' })
  @IsNotEmpty({ message: 'Setor é um campo obrigatório.' })
  turno!: TipoTurno;
}
