import { TipoDispensa } from '@/generated/prisma/enums';
import { Type } from 'class-transformer';
import {
  IsUUID,
  IsString,
  IsNotEmpty,
  IsDate,
  IsEnum,
  ValidateIf,
  Validate,
} from 'class-validator';

export class CreateDispensaDto {
  @IsUUID('all', { message: 'Usuário id inválido.' })
  @IsNotEmpty({ message: 'O usuário é um campo obrigatório.' })
  colaboradorId!: string;

  @IsString({ message: 'O tipo de dispensa não é do tipo String.' })
  @IsNotEmpty({ message: 'O tipo de dispensa é um campo obrigatório.' })
  @IsEnum(TipoDispensa, {
    message: 'Tipo dispensa não pertence ao enum TipoDispensa.',
  })
  tipoDispensa!: TipoDispensa;

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
}
