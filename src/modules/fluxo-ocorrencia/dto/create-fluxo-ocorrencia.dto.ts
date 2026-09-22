import { IsUUID, IsNotEmpty, IsDate, IsInt, Min } from 'class-validator';

export class CreateFluxoOcorrenciaDto {
  @IsUUID('all', { message: 'Ocorrência id inválida.' })
  @IsNotEmpty({ message: 'A ocorrência é um campo obrigatório.' })
  ocorrenciaId!: string;

  @IsUUID('all', { message: 'Usuário id inválido.' })
  @IsNotEmpty({ message: 'O usuário é um campo obrigatório.' })
  usuarioId!: string;

  @IsUUID('all', { message: 'Perfil transferido id inválido.' })
  @IsNotEmpty({ message: 'O perfil transferido é um campo obrigatório.' })
  transferidoPerfilId!: string;

  @IsDate({ message: 'A data inicial não é do tipo Date.' })
  @IsNotEmpty({ message: 'A data inicial é um campo obrigatório.' })
  dataInicial!: Date;
}
