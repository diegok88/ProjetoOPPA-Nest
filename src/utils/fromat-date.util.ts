import { Transform } from 'class-transformer';

export function FormatDate() {
  return Transform(({ value }) => {
    if (value instanceof Date) {
      return value.toLocaleDateString('pt-BR');
    }
    return value;
  });
}
// FUNÇÃO DE FORMATAÇÃO DE DATAS - APENAS APLICADO PARA OS ARQUIVOS RESPONSE
