// src/controle-jornada/consulta.constants.ts
import { Prisma } from '@/generated/prisma/client';
import { TipoEstadoJornada } from '@/generated/prisma/enums';

export type ConsultaConfig = Omit<
  Prisma.ControleJornadaFindManyArgs,
  'where' | 'skip' | 'take' | 'cursor' 
>;

/* Consulta de dados das relações*/
const COLABORADOR_PARCIAL = {
  select: { id: true, cracha: true, nome: true, turno: true },
} as const;

/* Consulta de dados */
export const CONSULTAS = {
  jornada_padrao: {
    orderBy: [{ dataRegistro: 'desc' }],
  },
  jornada_resumo: {
    orderBy: [{ dataRegistro: 'desc' }],
    include: { colaborador: COLABORADOR_PARCIAL },
  },
  jornada_por_codigo: {
    orderBy: [{ codigo: 'desc' }, { dataRegistro: 'asc' }],
    include: { colaborador: COLABORADOR_PARCIAL },
  },
  jornada_mais_antigos: {
    orderBy: [{ dataRegistro: 'asc' }],
    include: { colaborador: COLABORADOR_PARCIAL },
  },
  jornada_por_colaborador: {
    orderBy: [{ colaborador: { nome: 'asc' } }],
    include: { colaborador: COLABORADOR_PARCIAL },
  },
  jornada_colaborador_completo: {
    orderBy: [{ dataRegistro: 'desc' }],
    include: { colaborador: true },
  },
  jornada_minima: {
    orderBy: [{ dataRegistro: 'desc' }],
    select: { id: true, codigo: true, dataRegistro: true, status: true },
  },
} satisfies Record<string, ConsultaConfig>;

export type ConsultaControleJornada = keyof typeof CONSULTAS;

/* Eliminação de dados */
export const DESVIOS = {
  desvios: (): Prisma.ControleJornadaWhereInput => ({
    estadoJornada: { not: TipoEstadoJornada.CONFORME },
  }),
} satisfies Record<string, () => Prisma.ControleJornadaWhereInput>;

export type RecorteControleJornada = keyof typeof DESVIOS;
