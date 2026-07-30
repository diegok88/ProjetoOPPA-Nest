import { OmitType, PartialType, PickType } from '@nestjs/mapped-types';
import { IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';
import { CreateUsuarioDto } from './create-usuario.dto';

export class QueryUsuarioDto extends PartialType(
  OmitType(CreateUsuarioDto, ['registradoPorId']),
) {
  @IsOptional()
  @IsBoolean({ message: 'Status não é do tipo boleano.' })
  status?: boolean;

  @IsOptional()
  @IsString({ message: 'Campos não é do tipo string,' })
  campos?: string;
}

export class QueryAdminDto extends OmitType(QueryUsuarioDto, [
  'senha',
  'pin',
  'empresaId',
]) {}

export class QueryBagdeEnterpriceDto extends PickType(QueryUsuarioDto, [
  'cracha',
  'empresaId',
]) {}

export class QueryGenerateTokenDto extends PickType(QueryUsuarioDto, [
  'perfilId',
]) {}
