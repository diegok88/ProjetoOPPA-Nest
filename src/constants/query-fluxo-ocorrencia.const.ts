import { Prisma } from '@/generated/prisma/client';

export type ConsultaConfig = Omit<
  Prisma.FluxoOcorrenciaFindManyArgs,
  'where' | 'skip' | 'take' | 'cursor'
>;

export const CONSULTAS = {
  fluxo_padrao: {
    orderBy: [{ dataInicial: 'desc' }],
  },
  fluxo_parcial: {
    orderBy: [{ dataInicial: 'desc' }],
    include: { transferidoPerfil: true },
  },
  fluxo_completo: {
    orderBy: [{ dataInicial: 'desc' }],
    include: {
      ocorrencia: true,
      usuario: true,
      transferidoPerfil: true,
    },
  },
} satisfies Record<string, ConsultaConfig>;

export type ConsultaFluxoOcorrencia = keyof typeof CONSULTAS;

export const DESVIOS = {
  desvios: (): Prisma.FluxoOcorrenciaWhereInput => ({
    //estadoJornada: { not: TipoEstadoJornada.CONFORME },
  }),
} satisfies Record<string, () => Prisma.FluxoOcorrenciaWhereInput>;

export type RecorteFluxoOcorrencia = keyof typeof DESVIOS;
