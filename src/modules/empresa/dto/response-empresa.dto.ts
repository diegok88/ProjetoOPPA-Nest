
import { FormatCep } from '@/utils/format-cep.util';
import { FormatCNPJ } from '@/utils/format-cnpj.util';
import { FormatFone } from '@/utils/format-fone.util';
import { Expose, Transform } from 'class-transformer';

export class ResponseEmpresaDto {
  @Expose()
  id!: string;

  @Expose()
  codigo!: number;

  @Expose()
  @FormatCNPJ()
  cnpj!: string;

  @Expose()
  razaoSocial!: string;

  @Expose()
  nomeFantasia!: string;

  @Expose()
  @FormatFone()
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
  @FormatCep()
  cep!: string;

  @Expose()
  status!: boolean;
}
