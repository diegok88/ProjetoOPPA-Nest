import { TipoOcorrencia } from '@/generated/prisma/enums';

export class Ocorrencia {
  id!: string;
  estadoAtivoId!: string;
  falhaId?: string;
  solucaoId?: string;
  tipoOcorrencia!: TipoOcorrencia;
  solucionadoId?: string;
  dataInicial!: Date;
  dataFinal?: Date;
  status!: boolean;
}
