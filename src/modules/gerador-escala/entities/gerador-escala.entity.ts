import { TipoEscala } from '@/generated/prisma/enums';

export interface ResultadoEscala {
  data: string;
  escala: TipoEscala;
  posicaoNoCiclo: number;
  dataReferencia: string;
}
