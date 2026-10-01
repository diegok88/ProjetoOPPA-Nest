import { Prisma, Setores as SetorModel } from '@/generated/prisma/client';

export type Setores = SetorModel;

export type SetoresRelacao = Prisma.SetoresGetPayload<{
  include: { empresa: true };
}>;
