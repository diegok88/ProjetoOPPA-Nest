import { OmitType } from '@nestjs/mapped-types';
import { CreateUsuarioDto } from './create-usuario.dto';

export class DeleteUsuarioDto extends OmitType(CreateUsuarioDto, [
  'cracha',
  'dataAdmissao',
  'dataDesligamento',
  'dataNascimento',
  'escala',
  'nome',
  'perfilId',
  'pin',
  'senha',
  'turno',
]) {}
