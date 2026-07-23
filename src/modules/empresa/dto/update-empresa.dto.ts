import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateEmpresaDto } from './create-empresa.dto';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class UpdateEmpresaDto extends PartialType(CreateEmpresaDto) {
  @IsUUID('all', { message: 'Usuário com id inválido' })
  @IsNotEmpty({ message: 'RegistradoPorId é um campo obrigatório.' })
  registradoPorId!: string;
}

export class UpdateEmpresaDeactiveDto extends OmitType(CreateEmpresaDto, [
  'nomeFantasia',
  'razaoSocial',
  'bairro',
  'cep',
  'cidade',
  'cnpj',
  'contato',
  'email',
  'estado',
  'numero',
  'rua',
]) {}
