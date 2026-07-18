import { FormatDataAuditoria } from '@/utils/format-data-auditoria.util';
import { FormatDate } from '@/utils/fromat-date.util';
import { Expose } from 'class-transformer';

export class ResponseAuditoriaDto {
  @Expose()
  id!: string;

  @Expose()
  entidade!: string;

  @Expose()
  registroId!: string;

  @Expose()
  acao!: string;

  @Expose()
  @FormatDataAuditoria()
  dadosRegistrados!: string;

  @Expose()
  @FormatDate()
  dataHora!: Date;

  @Expose()
  registradoPorId!: string;
}
