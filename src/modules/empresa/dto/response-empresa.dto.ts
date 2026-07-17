import { FormatCep, FormatCNPJ, FormatFone } from '@/functions/dtos.function';
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
