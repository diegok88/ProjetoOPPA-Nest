import { FormatDate } from '@/utils/fromat-date.util';
import { transformRecordedData } from '@/utils/transform-recoded-data.util';
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
