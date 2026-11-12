import {
  IsUUID,
  IsString,
  IsEnum,
  IsOptional,
  IsDate,
  IsBoolean,
} from 'class-validator';
import { TipoOcorrencia } from '@/generated/prisma/enums';
import { Type } from 'class-transformer';

export class UpdateOcorrenciaDto {
  @IsOptional()
  @IsUUID('all', { message: 'Falha id inválida.' })
  falhaId?: string;

  @IsOptional()
  @IsUUID('all', { message: 'Solução id inválida.' })
  solucaoId?: string;

  @IsOptional()
  @IsString({ message: 'O tipo de ocorrência não é do tipo String.' })
  @IsEnum(TipoOcorrencia, {
    message: 'Tipo ocorrência não pertence ao enum TipoOcorrencia.',
  })
  tipoOcorrencia?: TipoOcorrencia;

  @IsOptional()
  @IsUUID('all', { message: 'Usuário id inválido.' })
  solucionadoId?: string;
}

