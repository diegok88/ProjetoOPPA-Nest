import { OmitType } from '@nestjs/mapped-types';
import { CreateUsuarioDto } from './create-usuario.dto';

export class CreateUsuarioMaster extends OmitType(CreateUsuarioDto, [
  'registradoPorId',
]) {}

export class CreateUsuarioAdmin extends OmitType(CreateUsuarioDto, [
  'senha',
  'pin',
  'empresaId',
]) {}

export class CresteUsuarioGestor extends OmitType(CreateUsuarioDto, [
  'senha',
  'pin',
]) {}
