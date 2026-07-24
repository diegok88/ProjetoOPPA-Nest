import { OmitType, PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { CreateUsuarioDto } from './create-usuario.dto';

export class UpdateUsuarioDto extends PartialType(CreateUsuarioDto) {
  @IsUUID('all', { message: 'Empresa id inválido.' })
  @IsNotEmpty({ message: 'Empresa é um campo obrigatório.' })
  empresaId!: string;
  @IsUUID('all', { message: 'Usuário id inválido.' })
  @IsNotEmpty({ message: 'Usuário é um campo obrigatório.' })
  registradoPorId!: string;
}

export class UpdateUsuarioDeactiveDto extends OmitType(CreateUsuarioDto, [
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
