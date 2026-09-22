import { PartialType } from '@nestjs/mapped-types';
import { CreateTipoSolicitacaoDto } from './create-tipo-solicitacao.dto';

export class UpdateTipoSolicitacaoDto extends PartialType(CreateTipoSolicitacaoDto) {}
