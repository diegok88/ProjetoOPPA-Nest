import { ResponseAuditoriaUsuarioCreateDto } from '@/modules/usuario/dto/response-auditoria-usuario-create.dto';
import { ResponseAuditoriaUsuarioUpdate } from '@/modules/usuario/dto/response-auditoria-usuario-update.dto';
import { plainToInstance, TransformFnParams } from 'class-transformer';

export const entidadeDtoMap: Record<string, any> = {
  USUARIO_CREATE: ResponseAuditoriaUsuarioCreateDto,
  USUARIO_UPDATE: ResponseAuditoriaUsuarioUpdate,
} as const;

export function transformRecordedData(params: TransformFnParams): any {
  const obj = params.obj;
  const valor = params.value;

  if (!obj || !valor) {
    return valor;
  }

  const entidade = obj.entidade;
  const acao = obj.acao;

  if (entidade && acao) {
    const chaveComposta = `${entidade}_${acao}`;
    const classeAlvo = entidadeDtoMap[chaveComposta];

    if (classeAlvo) {
      return plainToInstance(classeAlvo, valor, {
        excludeExtraneousValues: true,
      });
    }
  }

  return valor;
}
// FUNÇÃO DE APLICAÇÃO DO TIPO DE CLASSE DE RETORNO DE DADOS - APENAS APLICADO PARA OS ARQUIVOS RESPONSE DA AUDITORIA
