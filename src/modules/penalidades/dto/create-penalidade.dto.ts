import { TipoPenalidade } from '@/generated/prisma/enums';
import {
  IsUUID,
  IsString,
  IsNotEmpty,
  IsBoolean,
  IsDate,
  Length,
  IsEnum,
} from 'class-validator';

export class CreatePenalidadeDto {
  @IsUUID('all', { message: 'Usuário id inválido.' })
  @IsNotEmpty({ message: 'O usuário é um campo obrigatório.' })
  usuarioId!: string;

  @IsUUID('all', { message: 'Gestor id inválido.' })
  @IsNotEmpty({ message: 'O gestor é um campo obrigatório.' })
  gestorId!: string;

  @IsString({ message: 'A tipo penalidade não é do tipo String.' })
  @IsNotEmpty({ message: 'O tipo de penalidade é um campo obrigatório.' })
  @IsEnum(TipoPenalidade, {
    message: 'Tipo penalidade não pertence ao enum TipoPenalidade.',
  })
  tipoPenalidade!: TipoPenalidade;

  @IsDate({ message: 'A data inicial não é do tipo Date.' })
  @IsNotEmpty({ message: 'A data inicial é um campo obrigatório.' })
  dataInicial!: Date;

  @IsDate({ message: 'A data final não é do tipo Date.' })
  @IsNotEmpty({ message: 'A data final é um campo obrigatório.' })
  dataFinal!: Date;

  @IsString({ message: 'A justificativa não é do tipo String.' })
  @Length(10, 500, {
    message:
      'A justificativa deve conter no minimo 10 caracteres e no maximo 500 caracteres.',
  })
  justificativa?: string;
}
