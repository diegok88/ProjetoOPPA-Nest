import { Transform } from 'class-transformer';

export function FormatCNPJ() {
  return Transform(({ value }) => {
    if (!value) return null;
    const limpo = String(value).replace(/\D/g, '');
    return limpo.length === 14
      ? limpo.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')
      : value;
  });
}
// FUNÇÃO DE FORMATAÇÃO DE CNPJ - APENAS APLICADO PARA OS ARQUIVOS RESPONSE