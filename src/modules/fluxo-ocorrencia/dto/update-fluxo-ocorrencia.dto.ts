import { IsOptional, IsUUID } from 'class-validator';

export class UpdateFluxoOcorrenciaDto {
  @IsOptional()
  @IsUUID('all', { message: 'Usuário id inválido.' })
  usuarioId?: string;
}
