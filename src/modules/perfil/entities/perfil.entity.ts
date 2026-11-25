import { Perfil as PerfilModel } from '@/generated/prisma/client';

export type Perfil = PerfilModel;

/* CONSTANTE QUE DETERMINA A RESTRIÇÃO DE RETORNO DOS DADOS */
export const MAPA_VISIBILIDADE: Record<string, string[]> = {
  ASSISTENCIA: [
    'ASSISTÊNCIA',
    'ADMINISTRADOR',
    'GERENTE',
    'SUPERVISOR',
    'OPERADOR',
    'MANUTENÇÃO',
  ],
  ADMINISTRADOR: ['ADMINISTRADOR', 'GERENTE', 'MANUTENÇÃO'],
  GERENTE: ['SUPERVISOR'],
  SUPERVISOR: ['OPERADOR'],
};
