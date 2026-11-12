import { IsUUID, IsNotEmpty, IsDate, IsInt, Min } from 'class-validator';

export class CreateFluxoOcorrenciaDto {
  @IsUUID('all', { message: 'Ocorrência id inválida.' })
  @IsNotEmpty({ message: 'A ocorrência é um campo obrigatório.' })
  ocorrenciaId!: string;

  @IsUUID('all', { message: 'O transferidoPerfilId é inválido.' })
  @IsNotEmpty({ message: 'O transferidoPerfilId é um campo obrigatório.' })
  transferidoPerfilId!: string;
}
