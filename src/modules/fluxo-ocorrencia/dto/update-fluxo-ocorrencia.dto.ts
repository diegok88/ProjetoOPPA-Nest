import { CondicaoFluxo } from '@/generated/prisma/enums';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';

export class UpdateFluxoOcorrenciaDto {
  @IsOptional()
  @IsUUID('all', { message: 'Usuário id inválido.' })
  usuarioId?: string;

  @IsOptional()
  @IsEnum(CondicaoFluxo, {
    message: 'CondicaoFluxo não pertence ao enum CondicaoFluxo.',
  })
  condicaoFluxo?: CondicaoFluxo;
}
