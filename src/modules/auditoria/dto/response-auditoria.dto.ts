import { FormatDate, transformRecordedData } from '@/functions/dtos.function';
import { Expose, Transform } from 'class-transformer';

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
  @Transform(transformRecordedData)
  dadosRegistrados!: any;

  @Expose()
  @FormatDate()
  dataHora!: Date;

  @Expose()
  registradoPorId!: string;
}
