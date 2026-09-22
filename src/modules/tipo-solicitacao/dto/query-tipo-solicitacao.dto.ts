import { PartialType } from '@nestjs/mapped-types';
import { CreateTipoSolicitacaoDto } from './create-tipo-solicitacao.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class QueryTipoSolicitacaoFilterDto extends PartialType(
  CreateTipoSolicitacaoDto,
) {
  @IsOptional()
  @IsBoolean({ message: 'Status não é do tipo Boolean!' })
  status?: boolean;
}
