import { Transform } from 'class-transformer';

export function formatUppercase() {
  return Transform(({ value }) => {
    if (!value) return null;
    const maiusculo = String(value).toUpperCase();
    return maiusculo;
  });
}
// FUNÇÃO DE FORMATAÇÃO PARA MAIUSCULO - APENAS APLICADO PARA OS ARQUIVOS CREATE E UPDATE