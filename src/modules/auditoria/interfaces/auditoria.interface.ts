export interface AuditoriaUpdateData {
  tipo: 'UPDATE';
  id: string;
  entidade: string;
  mudancas: Record<string, { antes: unknown; depois: unknown }>;
  camposAlterados: string[];
  totalMudancas: number;
  resumo?: string;
}

export interface AuditoriaCreateData {
  tipo: 'CREATE';
  dados: unknown;
}

export interface AuditoriaDeleteData {
  tipo: 'DELETE';
  dados: unknown;
}

export interface AuditoriaLoginData {
  tipo: 'LOGIN';
  ip: string;
  userAgent: string;
  dataHora: string;
}

export type AuditoriaDataRecorded =
  | AuditoriaUpdateData
  | AuditoriaCreateData
  | AuditoriaDeleteData
  | AuditoriaLoginData;
