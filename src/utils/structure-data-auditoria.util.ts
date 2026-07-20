import { CreateAuditoriaDto } from '@/modules/auditoria/dto/create-auditoria.dto';

export function StructureDataAuditoriaCreate(
  entidade: string,
  registroId: string,
  dadosRegistrados: any,
  registradoPorId: string,
): any {
  const dados: CreateAuditoriaDto = {
    entidade: entidade,
    registroId: registroId,
    acao: 'CREATE',
    dadosRegistrados: dadosRegistrados,
    registradoPorId: registradoPorId,
  };
  return dados;
}
