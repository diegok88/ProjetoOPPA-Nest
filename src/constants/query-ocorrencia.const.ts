import { Prisma } from '@/generated/prisma/client';

export type ConsultaConfig = Omit<
  Prisma.OcorrenciaFindManyArgs,
  'where' | 'skip' | 'take' | 'cursor'
>;

export const CONSULTAS = {
  ocorrencia_padrao: {
    orderBy: [{ dataInicial: 'desc' }],
  },
  ocorrencia_falhas: {
    orderBy: [{ dataInicial: 'desc' }],
    include: {
      falhas: true,
    },
  },
  ocorrencia_completo: {
    orderBy: [{ dataInicial: 'desc' }],
    include: {
      estadoAtivo: true,
      falhas: true,
      solucoes: true,
      solucionado: true,
    },
  },
} satisfies Record<string, ConsultaConfig>;

export type ConsultaOcorrencia = keyof typeof CONSULTAS;

export const DESVIOS = {
  desvios: (): Prisma.OcorrenciaWhereInput => ({
    //estadoJornada: { not: TipoEstadoJornada.CONFORME },
  }),
} satisfies Record<string, () => Prisma.OcorrenciaWhereInput>;

export type RecorteOcorrencia = keyof typeof DESVIOS;
