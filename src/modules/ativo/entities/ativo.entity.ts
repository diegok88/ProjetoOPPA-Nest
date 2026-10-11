import { Ativo as AtivoModel, Prisma } from '@/generated/prisma/client';

export type Ativo = AtivoModel;

export type AtivoRelacoes = Prisma.AtivoGetPayload<{
  include: {
    falhaAtivo: true;
    tagAtivo: true;
    competenciaAtivo: true;
    empresa: true;
    setor: true;
  };
}>;
