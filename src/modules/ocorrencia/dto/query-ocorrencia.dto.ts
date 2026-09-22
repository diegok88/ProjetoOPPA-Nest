import { PartialType } from '@nestjs/mapped-types';
import { CreateOcorrenciaDto } from './create-ocorrencia.dto';
import { IsBoolean, IsOptional, IsUUID } from 'class-validator';

export class QueryOcorrenciaFilterDto extends PartialType(CreateOcorrenciaDto) {
  @IsOptional()
  @IsUUID('all', { message: 'Falha id inválida.' })
  falhaId?: string;

  @IsOptional()
  @IsUUID('all', { message: 'Solução id inválida.' })
  solucaoId?: string;

  @IsOptional()
  @IsUUID('all', { message: 'Usuário id inválido.' })
  solucionadoId?: string;

  @IsOptional()
  @IsBoolean({ message: 'Status não é do tipo Boolean!' })
  status?: boolean;
}
