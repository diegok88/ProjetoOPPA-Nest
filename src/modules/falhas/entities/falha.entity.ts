import { Falhas as FalhasModel, Prisma } from '@/generated/prisma/client';

export type Falhas = FalhasModel;

export type FalhasRelacoes = Prisma.FalhasGetPayload<{
  include: {
    ativo: true;
    perfil: true;
    solucaoFalha: true;
    ocorrenciaFalha: true;
  };
}>;

export type FalhasListagem = Falhas | FalhasRelacoes;
