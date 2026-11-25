import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { OBSERVACAO_MAX } from '../entities/query-solicitacoes.const';

export class CreateSolicitacoesDto {
  @IsUUID('all', { message: 'O solicitadoId é inválido.' })
  @IsNotEmpty({ message: 'O solicitadoId é obrigatório' })
  solicitadoId!: string;

  @IsUUID('all', { message: 'O solicitanteId é inválido.' })
  @IsNotEmpty({ message: 'O solicitanteId é obrigatório' })
  solicitanteId!: string;

  @IsOptional()
  @IsUUID('all', { message: 'O tipoSolicitacaoId é inválido.' })
  tipoSolicitacaoId?: string;

  @IsOptional()
  @IsUUID('all', { message: 'O tagAtivoId é inválido.' })
  tagAtivoId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(OBSERVACAO_MAX)
  observacao?: string;
}
