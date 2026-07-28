/* 
Constante tem por intuito padronizar as mensagens e avisos referente as
execuções dos endpoits.
*/
export const TYPES_NOTICES = {
  CREATE: 'Registro criado com sucesso!',
  CREATE_MANY: 'Registros criados com sucesso!',
  UPDATE: 'Registro atualizado com sucesso!',
  UPDATE_MANY: 'Registros atualizados com sucesso!',
  DEACTIVE: 'Registro inativado com sucesso!',
  DELETE: 'Registro removido com sucesso!',
  DELETE_MANY: 'Registros removidos com sucesso!',
  SERVICE_FAILURE: 'Falha na execução do serviço!',
  UNAUTHORIZED: 'Falha na autorização!',
  FIND_ALL: 'Lista de registros gerada com sucesso!',
  EMPTY_LIST: 'Lista de registros vazia!',
  FIND_ONE: 'Registro encontrado com sucesso!',
  NOT_FOUND: 'Registro não encontrado!',
  LOGOUT: 'Logout realizado com sucesso!',
  LOGIN: 'Login realizado com sucesso!',
} as const;
