import { FormatDate } from '@/functions/dtos.function';
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
  @Transform(({ value }) => {
    let resultado: any = {};
    resultado = value;
    console.log('Transformando dadosRegistrados:', value); // DEBUG
    return resultado ?? {};
  })
  dadosRegistrados!: any;

  @Expose()
  @FormatDate()
  dataHora!: Date;

  @Expose()
  registradoPorId!: string;
}
