// FUNÇÃO DE EXTRAÇÃO DE IDS
export function ExtractDataAuditoria(dados: any): any {
  const { id, ...dadosSemId } = dados;
  return dadosSemId;
}
// FUNÇÃO DE EXTRAÇÃO DE REGISTRADO POR ID
export function ExtractRegisteredById(dados: any): any {
  const { registradoPorId, ...dadosSemResgistrado } = dados;
  return dadosSemResgistrado;
}
