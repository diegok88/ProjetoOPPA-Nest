import { Transform } from 'class-transformer';

export function FormatFone() {
  return Transform(({ value }) => {
    if (!value) return null;
    const limpo = String(value).replace(/\D/g, '');
    return limpo.length === 11
      ? limpo.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3')
      : value;
  });
}
// FUNÇÃO DE FORMATAÇÃO DE CONTATO - APENAS APLICADO PARA OS ARQUIVOS RESPONSE