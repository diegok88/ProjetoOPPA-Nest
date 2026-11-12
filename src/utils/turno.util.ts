import { TipoTurno } from '@/generated/prisma/enums';

export type TurnoVigente = Exclude<TipoTurno, 'COMERCIAL'>;

export interface FaixaTurno {
  turno: TurnoVigente;
  inicio: number; // hora cheia, início inclusivo
  fim: number; // hora cheia, fim exclusivo
}

// NOITE cruza a meia-noite (22 até 6), tratado em estaNaFaixa
export const FAIXAS_TURNO: readonly FaixaTurno[] = [
  { turno: 'MANHA', inicio: 6, fim: 14 },
  { turno: 'TARDE', inicio: 14, fim: 22 },
  { turno: 'NOITE', inicio: 22, fim: 6 },
];

export const FUSO_REFERENCIA = 'America/Sao_Paulo';

/** Turno em vigor para a data informada (horário de Brasília). */
export function obterTurnoVigente(data: Date = new Date()): TurnoVigente {
  const hora = horaBrasilia(data);
  return FAIXAS_TURNO.find((f) => estaNaFaixa(hora, f))?.turno ?? 'NOITE';
}

/** Faixa completa de um turno, usada para exibição no front. */
export function obterFaixaTurno(turno: TurnoVigente): FaixaTurno {
  const faixa = FAIXAS_TURNO.find((f) => f.turno === turno);
  if (!faixa) throw new Error(`Turno inválido: ${turno}`);
  return faixa;
}

function estaNaFaixa(hora: number, { inicio, fim }: FaixaTurno): boolean {
  // Faixa que cruza a meia-noite: inicio > fim (ex.: 22 até 6)
  return inicio < fim
    ? hora >= inicio && hora < fim
    : hora >= inicio || hora < fim;
}

/** Hora cheia (0 a 23) em Brasília, independente do fuso do servidor. */
function horaBrasilia(data: Date): number {
  const hora = new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    hourCycle: 'h23',
    timeZone: FUSO_REFERENCIA,
  })
    .formatToParts(data)
    .find((p) => p.type === 'hour')?.value;

  return Number(hora);
}
