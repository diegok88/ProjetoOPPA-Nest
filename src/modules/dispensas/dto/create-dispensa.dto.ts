import { TipoDispensa } from '@/generated/prisma/enums';
import {
  IsUUID,
  IsString,
  IsNotEmpty,
  IsDate,
  IsEnum,
} from 'class-validator';

export class CreateDispensaDto {
  @IsUUID('all', { message: 'Usuário id inválido.' })
  @IsNotEmpty({ message: 'O usuário é um campo obrigatório.' })
  usuarioId!: string;

  @IsUUID('all', { message: 'Gestor id inválido.' })
  @IsNotEmpty({ message: 'O gestor é um campo obrigatório.' })
  gestorId!: string;

  @IsString({ message: 'O tipo de dispensa não é do tipo String.' })
  @IsNotEmpty({ message: 'O tipo de dispensa é um campo obrigatório.' })
  @IsEnum(TipoDispensa, {
    message: 'Tipo dispensa não pertence ao enum TipoDispensa.',
  })
  tipoDispensa!: TipoDispensa;

  @IsDate({ message: 'A data inicial não é do tipo Date.' })
  @IsNotEmpty({ message: 'A data inicial é um campo obrigatório.' })
  dataInicial!: Date;

  @IsDate({ message: 'A data final não é do tipo Date.' })
  @IsNotEmpty({ message: 'A data final é um campo obrigatório.' })
  dataFinal!: Date;
}
