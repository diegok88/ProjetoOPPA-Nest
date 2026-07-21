import { OmitType } from '@nestjs/mapped-types';
import { CreateUsuarioDto } from './create-usuario.dto';

export class CreateUsuarioMaster extends OmitType(CreateUsuarioDto, [
  'cracha',
  'dataAdmissao',
  'dataNascimento',
  'dataDesligamento',
  'escala',
  'turno',
  'perfilId',
  'empresaId',
  'registradoPorId',
]) {}

export class CreateUsuarioAdmin extends OmitType(CreateUsuarioDto, [
  'senha',
  'pin',
  'dataDesligamento',
  'empresaId',
]) {}

export class CreateUsuarioGestor extends OmitType(CreateUsuarioDto, [
  'dataDesligamento',
  'senha',
  'pin',
]) {}
