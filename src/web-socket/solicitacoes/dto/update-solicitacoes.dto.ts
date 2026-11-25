import { PartialType } from '@nestjs/mapped-types';
import { CreateSolicitacoesDto } from './create-solicitacoes.dto';

export class UpdateSolicitacoesDto extends PartialType(CreateSolicitacoesDto) {}
