import {
  Prisma,
  Penalidade as PenalidadeModel,
} from '@/generated/prisma/client';

export type Penalidade = PenalidadeModel;

export type PenalidadeRelacoes = Prisma.PenalidadeGetPayload<{
  include: { colaborador: true; gestor: true };
}>;

export type PenalidadeRelacoesParcial = Prisma.PenalidadeGetPayload<{
  include: {
    colaborador: { select: { nome: true; cracha: true } };
    gestor: { select: { nome: true; cracha: true } };
  };
}>;

export type PenalidadeColaborador = Prisma.PenalidadeGetPayload<{
  include: { colaborador: true };
}>;

export type PenalidadeGestor = Prisma.PenalidadeGetPayload<{
  include: { gestor: true };
}>;

export type PenalidadeColaboradorParcial = Prisma.PenalidadeGetPayload<{
  include: { colaborador: { select: { nome: true; cracha: true } } };
}>;

export type PenalidadeGestorParcial = Prisma.PenalidadeGetPayload<{
  include: { gestor: { select: { nome: true; cracha: true } } };
}>;

export type PenalidadeListagem =
  | Penalidade
  | PenalidadeRelacoes
  | PenalidadeRelacoesParcial
  | PenalidadeColaborador
  | PenalidadeGestor
  | PenalidadeColaboradorParcial
  | PenalidadeGestorParcial;
