import { FormatDate } from '@/utils/fromat-date.util';
import { Expose } from 'class-transformer';

export class ResponseUsuarioDto {
  @Expose()
  id!: string;

  @Expose()
  cracha!: number;

  @Expose()
  nome!: string;

  @Expose()
  @FormatDate()
  dataNascimento!: Date;

  @Expose()
  @FormatDate()
  dataAdmissao!: Date;

  @Expose()
  @FormatDate()
  dataDesligamento?: Date | null;

  @Expose()
  senha!: string;

  @Expose()
  pin!: string;

  @Expose()
  perfilId!: string;

  @Expose()
  turno!: string;

  @Expose()
  escala!: string;

  @Expose()
  empresaId!: string;

  @Expose()
  status!: boolean;
}
