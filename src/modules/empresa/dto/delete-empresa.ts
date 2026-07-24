import { OmitType } from '@nestjs/mapped-types';
import { CreateEmpresaDto } from './create-empresa.dto';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class DeleteEmpresaDto extends OmitType(CreateEmpresaDto, [
  'bairro',
  'cep',
  'cidade',
  'cnpj',
  'contato',
  'email',
  'estado',
  'nomeFantasia',
  'numero',
  'razaoSocial',
  'rua',
]) {
  @IsUUID()
  @IsNotEmpty()
  empresaId!: string;
}
