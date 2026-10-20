const FORMATO_DATA = /^\d{4}-\d{2}-\d{2}$/;

/** Início do dia (00:00) em Brasília. Ex.: "2026-11-12" -> 2026-11-12T03:00:00.000Z */
export function inicioDoDiaBrasilia(valor: unknown): unknown {
  if (typeof valor !== 'string' || !FORMATO_DATA.test(valor)) return valor;
  return new Date(`${valor}T00:00:00.000-03:00`);
}

/** Fim do dia (23:59:59.999) em Brasília. */
export function fimDoDiaBrasilia(valor: unknown): unknown {
  if (typeof valor !== 'string' || !FORMATO_DATA.test(valor)) return valor;
  return new Date(`${valor}T23:59:59.999-03:00`);
}
