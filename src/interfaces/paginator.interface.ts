export interface PaginatedResponse<T> {
  dados: T[];
  total: number;
  pagina: number;
  tamanho: number;
}
