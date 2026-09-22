import {
  IsUUID,
  IsNotEmpty,
  IsDate,
} from 'class-validator';

export class CreateOcorrenciaDto {
  @IsUUID('all', { message: 'Estado ativo id inválido.' })
  @IsNotEmpty({ message: 'O estado do ativo é um campo obrigatório.' })
  estadoAtivoId!: string;

  @IsDate({ message: 'A data inicial não é do tipo Date.' })
  @IsNotEmpty({ message: 'A data inicial é um campo obrigatório.' })
  dataInicial!: Date;
}
