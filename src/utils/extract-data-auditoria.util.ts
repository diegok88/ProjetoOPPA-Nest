export function ExtractDataAuditoria(dados: any): any {
  const { id, ...dadosSemId } = dados;
  return dadosSemId;
}
