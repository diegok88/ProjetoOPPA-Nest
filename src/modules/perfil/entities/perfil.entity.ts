import { Perfil as PerfilModel } from '@/generated/prisma/client';

export type Perfil = PerfilModel;

/* CONSTANTE QUE DETERMINA A RESTRIÇÃO DE RETORNO DOS DADOS */
export const MAPA_VISIBILIDADE: Record<string, string[]> = {
  ASSISTENCIA: ['ASSISTENCIA', 'ADMINISTRADOR', 'GESTOR', 'OPERADOR'],
  ADMINISTRADOR: ['ADMINISTRADOR', 'GESTOR', 'OPERADOR'],
  GESTOR: ['OPERADOR'],
};
