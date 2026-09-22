import { TipoPenalidade } from '@/generated/prisma/enums';

export class Penalidade {
  id!: string;
  usuarioId!: string;
  gestorId!: string;
  tipoPenalidade!: TipoPenalidade;
  dataInicial!: Date;
  dataFinal!: Date;
  justificativa?: string;
  status!: boolean;
}
