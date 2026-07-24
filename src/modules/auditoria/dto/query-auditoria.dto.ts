import { OmitType } from '@nestjs/mapped-types';
import { CreateAuditoriaDto } from './create-auditoria.dto';
import { IsOptional, IsUUID } from 'class-validator';

export class QueryAuditoriaRegisteredByIdDto extends OmitType(
  CreateAuditoriaDto,
  ['acao', 'entidade', 'registroId', 'dadosRegistrados'],
) {
  @IsOptional()
  @IsUUID()
  registroId?: string;
}
