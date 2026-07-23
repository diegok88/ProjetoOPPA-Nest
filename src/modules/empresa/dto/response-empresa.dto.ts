import { FormatCep } from '@/utils/format-cep.util';
import { FormatCNPJ } from '@/utils/format-cnpj.util';
import { FormatFone } from '@/utils/format-fone.util';
import { OmitType } from '@nestjs/mapped-types';
import { Expose } from 'class-transformer';

export class ResponseEmpresaDto {
  @Expose()
  id!: string;

  @Expose()
  codigo!: number;

  @Expose()
  cnpj!: string;

  @Expose()
  razaoSocial!: string;

  @Expose()
  nomeFantasia!: string;

  @Expose()
  contato!: string;

  @Expose()
  email!: string;

  @Expose()
  rua!: string;

  @Expose()
  numero!: string;

  @Expose()
  bairro!: string;

  @Expose()
  cidade!: string;

  @Expose()
  estado!: string;

  @Expose()
  cep!: string;

  @Expose()
  status!: boolean;
}

export class ResponseEmpresaAdminDto extends OmitType(ResponseEmpresaDto, [
  'cnpj',
  'contato',
  'cep',
]) {
  @Expose()
  @FormatCNPJ()
  cnpj!: string;

  @Expose()
  @FormatFone()
  contato!: string;

  @Expose()
  @FormatCep()
  cep!: string;
}
