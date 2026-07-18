import { Transform } from 'class-transformer';

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
// FUNÇÃO DE RETORNO DE OBJETOS - APENAS APLICADO PARA OS ARQUIVOS RESPONSE
