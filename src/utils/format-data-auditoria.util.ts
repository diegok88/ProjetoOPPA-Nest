import { Transform } from 'class-transformer';

export function FormatDataAuditoria() {
  return Transform(({ value }) => {
    if (typeof value === 'string') {
      const limpo = value.split('\"').join('');
      return limpo;
    }
    return value;
  });
}
