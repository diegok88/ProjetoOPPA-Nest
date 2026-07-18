import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { CreateUsuarioDto } from './create-usuario.dto';

export class UpdateUsuarioDto extends PartialType(CreateUsuarioDto) {
  @IsUUID('all', { message: 'Usuário id inválido.' })
  @IsNotEmpty({ message: 'Usuário é um campo obrigatório.' })
  registradoPorId!: string;
}
