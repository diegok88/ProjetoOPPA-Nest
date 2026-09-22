/* ENTIDADE DO MODULO DE API */
export class Perfil {
  id!: string;
  codigo!: number;
  descricao!: string;
  status!: boolean;
}

/* CONSTANTE QUE DETERMINA A RESTRIÇÃO DE RETORNO DOS DADOS */
export const MAPA_VISIBILIDADE: Record<string, string[]> = {
  ASSISTENCIA: ['ASSISTENCIA', 'ADMINISTRADOR', 'GESTOR', 'OPERADOR'],
  ADMINISTRADOR: ['ADMINISTRADOR', 'GESTOR', 'OPERADOR'],
  GESTOR: ['OPERADOR'],
};
