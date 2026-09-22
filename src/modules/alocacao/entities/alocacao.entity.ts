import { CondicaoAlocacao } from '@/generated/prisma/enums';

export class Alocacao {
  id!: string;
  operadorId!: string;
  gestorId!: string;
  tagAtivoId!: string;
  condicao!: CondicaoAlocacao;
  status!: boolean;
}
