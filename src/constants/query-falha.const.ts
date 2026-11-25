import { Prisma } from '@/generated/prisma/client';

export type ConsultaConfig = Omit<
  Prisma.FalhasFindManyArgs,
  'where' | 'skip' | 'take' | 'cursor'
>;

export const CONSULTAS = {
  falhas_padrao: {
    orderBy: [{ codigo: 'asc' }],
  },
  falhas_completo: {
    orderBy: [{ codigo: 'desc' }], 
    include: {
      ativo: true,
      perfil: true,
      solucaoFalha: true,
      ocorrenciaFalha: true,
    },
  },
} satisfies Record<string, ConsultaConfig>;

export type ConsultaFalhas = keyof typeof CONSULTAS;

export const DESVIOS = {
  desvios: (): Prisma.FalhasWhereInput => ({
    //estadoJornada: { not: TipoEstadoJornada.CONFORME },
  }),
} satisfies Record<string, () => Prisma.FalhasWhereInput>;

export type RecorteFalhas = keyof typeof DESVIOS;
