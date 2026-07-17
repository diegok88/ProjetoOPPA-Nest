import { Transform } from 'class-transformer';

// FUNÇÕES DE CREATE
// FORMATAÇÃO DAS STRING PARA MAIUSCULOS
export function formatUppercase() {
  return Transform(({ value }) => {
    if (!value) return null;
    const maiusculo = String(value).toUpperCase();
    return maiusculo;
  });
}

// FUNÇÕES DE RESPONSE - RETORNO DE DADOS COSTUMIZADOS
// FORMATAÇÃO O CNPJ
export function FormatCNPJ() {
  return Transform(({ value }) => {
    if (!value) return null;
    const limpo = String(value).replace(/\D/g, '');
    return limpo.length === 14
      ? limpo.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')
      : value;
  });
}
// FORMATAÇÃO DO CONTATO TELEFONICO
export function FormatFone() {
  return Transform(({ value }) => {
    if (!value) return null;
    const limpo = String(value).replace(/\D/g, '');
    return limpo.length === 11
      ? limpo.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3')
      : value;
  });
}
// FORMATAÇÃO DO CEP
export function FormatCep() {
  return Transform(({ value }) => {
    if (!value) return null;
    const limpo = String(value).replace(/\D/g, '');
    return limpo.length === 8
      ? limpo.replace(/^(\d{2})(\d{3})(\d{3})$/, '$1.$2-$3')
      : value;
  });
}
// FORMATAÇÃO PARA RETORNAR DATAS
export function FormatDate() {
  return Transform(({ value }) => {
    if (value instanceof Date) {
      return value.toLocaleDateString('pt-BR');
    }
    return value;
  });
}
// FORMATAÇÃO PARA RETORNAR OBJETOS - apenas de um dados dentro do objeto
export function ReturnObjectPerfil() {
  return Transform(({ obj }) => {
    return obj?.perfil?.descricao || '';
  });
}
export function ReturnObjectEmpresa() {
  return Transform(({ obj }) => {
    return obj?.empresa?.razaoSocial || '';
  });
}
