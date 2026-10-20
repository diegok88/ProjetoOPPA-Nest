import { TipoPenalidade } from '@/generated/prisma/enums';
import { Type } from 'class-transformer';
import {
  IsUUID,
  IsString,
  IsNotEmpty,
  IsDate,
  Length,
  IsEnum,
  ValidateIf,
  Validate,
} from 'class-validator';

export class CreatePenalidadeDto {
  @IsUUID('all', { message: 'Colaborador id inválido.' })
  @IsNotEmpty({ message: 'O colaborador é um campo obrigatório.' })
  colaboradorId!: string;

  @IsString({ message: 'A tipo penalidade não é do tipo String.' })
  @IsNotEmpty({ message: 'O tipo de penalidade é um campo obrigatório.' })
  @IsEnum(TipoPenalidade, {
    message: 'Tipo penalidade não pertence ao enum TipoPenalidade.',
  })
  tipoPenalidade!: TipoPenalidade;

  @Type(() => Date)
  @IsDate({ message: 'A data inicial não é do tipo Date.' })
  @IsNotEmpty({ message: 'A data inicial é um campo obrigatório.' })
  dataInicial!: Date;

  @Type(() => Date)
  @IsDate({ message: 'A data final não é do tipo Date.' })
  @IsNotEmpty({ message: 'A data final é um campo obrigatório.' })
  @ValidateIf(
    (o) => o.dataInicial instanceof Date && o.dataFinal instanceof Date,
  )
  @Validate(
    (o: { dataFinal: Date; dataInicial: Date }) => o.dataFinal >= o.dataInicial,
    {
      message: 'DataFinal não pode ser anterior à DataInicial!',
    },
  )
  dataFinal!: Date;

  @IsString({ message: 'A justificativa não é do tipo String.' })
  @Length(10, 1000, {
    message:
      'A justificativa deve conter no minimo 10 caracteres e no maximo 500 caracteres.',
  })
  justificativa?: string;
}
