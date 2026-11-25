import {
  CompetenciaSetorial as CompetenciaSetorialModel,
  Prisma,
} from '@/generated/prisma/client';

export type CompetenciaSetorial = CompetenciaSetorialModel;

export type CompetenciaSetorialRelacao = Prisma.CompetenciaSetorialGetPayload<{
  include: {
    setor: { include: { ativoSetores: { include: { tagAtivo: true } } } };
  };
}>;

export class CompetenciaSetorialGestor {
  setorId!: string;
  codigo!: number;
  descricao!: string;
  turno!: string;
  totalAtivos!: number;
  produzindo!: number;
  parado!: number;
  falha!: number;
}
