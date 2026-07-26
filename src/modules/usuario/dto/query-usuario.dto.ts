import { OmitType, PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';
import { CreateUsuarioDto } from './create-usuario.dto';

export class QueryUsuarioDto extends PartialType(
  OmitType(CreateUsuarioDto, ['senha', 'pin', 'registradoPorId']),
) {
  @IsOptional()
  @IsUUID('all', { message: 'Usuário id inválido.' })
  id?: string;

  @IsOptional()
  @IsBoolean({ message: 'Status não é do tipo boleano.' })
  status?: boolean;

  @IsOptional()
  @IsString({ message: 'Campos não é do tipo string,' })
  campos?: string;
}

export class QueryAdminDto extends OmitType(QueryUsuarioDto, [
  'id',
  'dataAdmissao',
  'dataDesligamento',
  'dataNascimento',
  'nome',
  'escala',
  'turno',
  'cracha',
]) {}
