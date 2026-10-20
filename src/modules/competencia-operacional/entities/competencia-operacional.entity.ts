import {
  CompetenciaOperacional as CompetenciaOperacionalModel,
  Prisma,
} from '@/generated/prisma/client';

export type CompetenciaOperacional = CompetenciaOperacionalModel;

export type CompetenciaOperacionalRelacao =
  Prisma.CompetenciaOperacionalGetPayload<{
    include: {
      operador: true;
      gestor: true;
      ativo: true;
    };
  }>;

export type CompetenciaOperacionalRelacaoParcial =
  Prisma.CompetenciaOperacionalGetPayload<{
    include: {
      operador: { select: { id: true; nome: true; cracha: true } };
      gestor: { select: { id: true; nome: true; cracha: true } };
      ativo: { select: { id: true; descricao: true; modelo: true } };
    };
  }>;

export type CompetenciaOperacionalListagem =
  | CompetenciaOperacional
  | CompetenciaOperacionalRelacao
  | CompetenciaOperacionalRelacaoParcial;
