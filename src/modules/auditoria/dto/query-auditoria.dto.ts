import { OmitType, PartialType, PickType } from '@nestjs/mapped-types';
import { IsDate, IsOptional, IsUUID } from 'class-validator';
import { CreateAuditoriaDto } from './create-auditoria.dto';

export class QueryAuditoriaRegisteredByIdDto extends OmitType(
  CreateAuditoriaDto,
  ['acao', 'entidade', 'registroId', 'dadosRegistrados'],
) {
  @IsOptional()
  @IsUUID()
  registroId?: string;
}

export class QueryAuditoriaFindOneLastDto extends PickType(CreateAuditoriaDto, [
  'acao',
  'empresaId',
  'registradoPorId',
]) {}

export class QueryAuditoriaFilterDto extends PartialType(
  OmitType(CreateAuditoriaDto, ['dadosRegistrados']),
) {
  @IsDate({ message: 'Data e hora não é do tipo Date!' })
  @IsOptional()
  dataHora?: Date;
}
