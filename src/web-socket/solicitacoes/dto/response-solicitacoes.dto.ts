import { IsIn, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { OBSERVACAO_MAX } from '../entities/query-solicitacoes.const';

export class ResponderSolicitacoesDto {
  @IsUUID()
  id!: string;

  @IsIn(['ACEITAR', 'RECUSAR'])
  acao!: 'ACEITAR' | 'RECUSAR';

  @IsOptional()
  @IsString()
  @MaxLength(OBSERVACAO_MAX)
  observacao?: string;

  @IsOptional()
  @IsUUID('all', { message: 'Solicitado id inválido.' })
  solicitadoId?: string;
}
