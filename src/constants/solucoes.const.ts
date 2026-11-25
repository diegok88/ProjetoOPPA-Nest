import { Prisma } from '@/generated/prisma/client';

export type ConsultaConfig = Omit<
  Prisma.SolucoesFindManyArgs,
  'where' | 'skip' | 'take' | 'cursor'
>;

export const CONSULTAS = {
  solucoes_padrao: {
    orderBy: [{ codigo: 'asc' }],
  },
  solucoes_completo: {
    orderBy: [{ codigo: 'desc' }],
    include: {
      falha: true,
      perfil: true,
    },
  },
} satisfies Record<string, ConsultaConfig>;

export type ConsultaSolucoes = keyof typeof CONSULTAS;

export const DESVIOS = {
  desvios: (): Prisma.SolucoesWhereInput => ({
    //estadoJornada: { not: TipoEstadoJornada.CONFORME },
  }),
} satisfies Record<string, () => Prisma.SolucoesWhereInput>;

export type RecorteSolucoes = keyof typeof DESVIOS;
