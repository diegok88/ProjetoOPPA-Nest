import {
  CompetenciaSetorial as CompetenciaSetorialModel,
  Prisma,
} from '@/generated/prisma/client';

export type CompetenciaSetorial = CompetenciaSetorialModel;

export type CompetenciaSetorialRelacao = Prisma.CompetenciaSetorialGetPayload<{
  include: { setor: true };
}>;
