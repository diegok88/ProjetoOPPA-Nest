import { TipoEscala } from '@/generated/prisma/enums';
import { Expose } from 'class-transformer';

export class ResponseGeradorEscalaDto {
  @Expose() data!: string;
  @Expose() escala!: TipoEscala;
  @Expose() posicaoNoCiclo!: number;
  @Expose() dataReferencia!: string;
}
