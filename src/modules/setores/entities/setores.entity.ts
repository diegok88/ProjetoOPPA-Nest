import { Prisma, Setores as SetorModel } from '@/generated/prisma/client';

export type Setores = SetorModel;

/* TYPE USADO NA ENTIDADE COMPETENCIA SETORIAL */
export type SetoresCompetencia = Prisma.SetoresGetPayload<{
  select: { id: true; codigo: true; descricao: true };
}>;

export type SetoresRelacao = Prisma.SetoresGetPayload<{
  include: { empresa: true };
}>;
