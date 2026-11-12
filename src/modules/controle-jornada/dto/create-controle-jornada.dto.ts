import { TipoEstadoJornada, TipoJornada } from '@/generated/prisma/enums';
import {
  IsUUID,
  IsString,
  IsNotEmpty,
  IsBoolean,
  IsDate,
  IsEnum,
} from 'class-validator';

export class CreateControleJornadaDto {
  @IsUUID('all', { message: 'Usuário id inválido.' })
  @IsNotEmpty({ message: 'O usuário é um campo obrigatório.' })
  usuarioId!: string;

  @IsString({ message: 'O tipo de jornada não é do tipo String.' })
  @IsNotEmpty({ message: 'O tipo de jornada é um campo obrigatório.' })
  @IsEnum(TipoJornada, {
    message: 'Tipo jornada não pertence ao enum TipoJornada.',
  })
  tipoJornada!: TipoJornada;

  @IsUUID('all', { message: 'Tag ativo id inválido.' })
  @IsNotEmpty({ message: 'A tag do ativo é um campo obrigatório.' })
  tagAtivoId!: string;
}
