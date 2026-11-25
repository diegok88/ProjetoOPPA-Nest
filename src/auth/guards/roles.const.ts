export const ROLES = {
  ASN1: 'ASSISTÊNCIA - NIVEL 1',
  ADN1: 'ADMINISTRADOR - NIVEL 1',
  GER1: 'GERENTE - NIVEL 1',
  SUP1: 'SUPERVISOR - NIVEL 1',
  OPE1: 'OPERADOR - NIVEL 1',
  TER1: 'TERMINAL - NIVEL 1',
  DIS1: 'DISPOSITIVO - NIVEL 1',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export interface PerfilLike {
  descricao?: string | null;
  nivel?: string | null;
  status?: boolean | null;
}

export type PerfilRef = PerfilLike | string | null | undefined;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DIACRITICOS = /[\u0300-\u036f]/g;
const NAO_ALFANUMERICO = /[^A-Z0-9]+/g;
const SUFIXO_NIVEL = /(?:NIVEL|NIV)\s*(\d+)\s*$/;

export function ehPerfilId(valor?: string | null): boolean {
  return !!valor && UUID.test(valor.trim());
}

export function normalizar(valor?: string | null): string {
  if (!valor) return '';
  return valor
    .normalize('NFD')
    .replace(DIACRITICOS, '')
    .toUpperCase()
    .replace(NAO_ALFANUMERICO, ' ')
    .trim();
}

export function normalizarNivel(valor?: string | null): string {
  const n = normalizar(valor);
  if (!n) return '';
  const match = n.match(/(\d+)/);
  return match ? `N${match[1]}` : n;
}

export function decomporPerfil(perfil: PerfilRef): {
  base: string;
  nivel: string;
} {
  const descricaoBruta =
    typeof perfil === 'string' ? perfil : perfil?.descricao ?? '';
  const nivelBruto = typeof perfil === 'string' ? '' : perfil?.nivel ?? '';

  const descricaoNormalizada = normalizar(descricaoBruta);
  const match = descricaoNormalizada.match(SUFIXO_NIVEL);

  const base = match
    ? descricaoNormalizada.slice(0, match.index ?? 0).trim()
    : descricaoNormalizada;

  const nivel = (match ? `N${match[1]}` : '') || normalizarNivel(nivelBruto);

  return { base, nivel };
}

export function chavePerfil(perfil: PerfilRef): string {
  const { base, nivel } = decomporPerfil(perfil);
  if (!base) return nivel;
  return nivel ? `${base} ${nivel}` : base;
}

export function chavePerfilSemNivel(perfil: PerfilRef): string {
  return decomporPerfil(perfil).base;
}

export function perfilEm(
  perfil: PerfilRef,
  esperados: readonly string[],
): boolean {
  if (!perfil) return false;

  const alvo = decomporPerfil(perfil);
  if (!alvo.base) return false;

  return esperados.some((esperado) => {
    const ref = decomporPerfil(esperado);
    if (ref.base !== alvo.base) return false;
    if (!ref.nivel || !alvo.nivel) return true;
    return ref.nivel === alvo.nivel;
  });
}
