import { Acao } from '@/generated/prisma/enums';
import { CreateAuditoriaDto } from '@/modules/auditoria/dto/create-auditoria.dto';
import { UpdateAuditoriaDto } from '@/modules/auditoria/dto/update-auditoria.dto';

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
export function StructureDataAuditoriaUpdate(
  entidade: string,
  registroId: string,
  antes: any,
  depois: any,
  registradoPorId: string,
) {
  const dados: UpdateAuditoriaDto = {
    entidade: entidade,
    registroId: registroId,
    acao: 'UPDATE',
    antes: antes,
    depois: depois,
    registradoPorId: registradoPorId,
  };
  return dados;
}
