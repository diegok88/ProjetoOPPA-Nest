import { Transform } from 'class-transformer';

export function FormatCep() {
  return Transform(({ value }) => {
    if (!value) return null;
    const limpo = String(value).replace(/\D/g, '');
    return limpo.length === 8
      ? limpo.replace(/^(\d{2})(\d{3})(\d{3})$/, '$1.$2-$3')
      : value;
  });
}
// FUNÇÃO DE FORMATAÇÃO DE CEP - APENAS APLICADO PARA OS ARQUIVOS RESPONSE