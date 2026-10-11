import { TagAtivo as TagAtivoModel, Prisma } from '@/generated/prisma/client';

export type TagAtivo = TagAtivoModel;

export type TagAtivoRelacoes = Prisma.TagAtivoGetPayload<{
  include: {
    ativo: true;
  };
}>;
