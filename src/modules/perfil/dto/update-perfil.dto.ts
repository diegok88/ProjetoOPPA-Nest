import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreatePerfilDto } from './create-perfil.dto';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class UpdatePerfilDto extends PartialType(CreatePerfilDto) {
  @IsUUID('all', { message: 'Empresa id inválido.' })
  @IsNotEmpty({ message: 'Empresa é um campo obrigatório.' })
  empresaId!: string;

  @IsUUID('all', { message: 'Usuário id inválido.' })
  @IsNotEmpty({ message: 'Usuário é um campo obrigatório.' })
  registradoPorId!: string;
}

export class UpdatePerfilDeactiveDto extends OmitType(CreatePerfilDto, [
  'descricao',
]) {}
