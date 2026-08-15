import { Acao } from '@/generated/prisma/enums';
import { OmitType, PickType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
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

export class QueryAuditoriaFilterDto {
  @IsOptional()
  @IsString()
  entidade?: string;

  @IsOptional()
  @IsString()
  registroId?: string;

  @IsOptional()
  @IsEnum(Acao)
  acao?: Acao;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dataHora?: Date;

  @IsOptional()
  @IsString()
  empresaId?: string;

  @IsOptional()
  @IsString()
  registradoPorId?: string;
}
