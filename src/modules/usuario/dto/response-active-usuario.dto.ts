import { FormatDate } from '@/functions/dtos.function';
import { Expose } from 'class-transformer';

export class ResponseActiveUsuario {
  @Expose()
  id!: string;

  @Expose()
  cracha!: number;

  @Expose()
  nome!: string;

  @Expose()
  @FormatDate()
  dataAdmissao!: Date;

  @Expose()
  perfil!: string;

  @Expose()
  turno!: string;

  @Expose()
  escala!: string;
}
