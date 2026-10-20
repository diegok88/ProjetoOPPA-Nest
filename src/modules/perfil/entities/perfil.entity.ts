import { Perfil as PerfilModel } from '@/generated/prisma/client';

export type Perfil = PerfilModel;

/* CONSTANTE QUE DETERMINA A RESTRIÇÃO DE RETORNO DOS DADOS */
export const MAPA_VISIBILIDADE: Record<string, string[]> = {
  ASSISTENCIA: [
    'ASSISTENCIA',
    'ADMINISTRADOR',
    'GERENTE',
    'SUPERVISOR',
    'OPERADOR',
  ],
  ADMINISTRADOR: ['ADMINISTRADOR', 'GERENTE'],
  GERENTE: ['SUPERVISOR'],
  SUPERVISOR: ['OPERADOR'],
};
