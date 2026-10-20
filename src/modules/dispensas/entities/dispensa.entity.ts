import { Dispensa as DispensaModel, Prisma } from '@/generated/prisma/client';

export type Dispensa = DispensaModel;

export type DispensaRelacao = Prisma.DispensaGetPayload<{
  include: { colaborador: true; gestor: true };
}>;

export type DispensaRelacaoParcial = Prisma.DispensaGetPayload<{
  include: {
    colaborador: { select: { id: true; cracha: true; nome: true } };
    gestor: { select: { id: true; cracha: true; nome: true } };
  };
}>;

export type DispensaColaborados = Prisma.DispensaGetPayload<{
  include: { colaborador: true };
}>;

export type DispensaColaboradosParcial = Prisma.DispensaGetPayload<{
  include: { colaborador: { select: { id: true; cracha: true; nome: true } } };
}>;

export type DispensaGestor = Prisma.DispensaGetPayload<{
  include: { gestor: true };
}>;

export type DispensaGestorParcial = Prisma.DispensaGetPayload<{
  include: { gestor: { select: { id: true; cracha: true; nome: true } } };
}>;

export type DispensaListagem =
  | Dispensa
  | DispensaRelacao
  | DispensaRelacaoParcial
  | DispensaColaborados
  | DispensaColaboradosParcial
  | DispensaGestor
  | DispensaGestorParcial;
