import { Acao } from '@/generated/prisma/enums';

export class Auditoria {
  id!: string;
  entidade!: string;
  registroId!: string;
  acao!: Acao;
  dadosRegistrados!: string;
  dataHora!: Date;
  empresaId!: string;
  registradoPorId!: string;
}
