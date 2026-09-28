import { Gestor as GestorModel, Prisma } from '@/generated/prisma/client';

export type Gestor = GestorModel;

export type GestorRelacoes = Prisma.GestorGetPayload<{
  include: {
    colaborador: true;
    gestor: true;
  };
}>;

export type GestorComRelacoes = Prisma.GestorGetPayload<{
  include: {
    colaborador: { select: { id: true; cracha: true; nome: true } };
    gestor: { select: { id: true; cracha: true; nome: true } };
  };
}>;

export type GestorUsuario = Prisma.GestorGetPayload<{
  include: {
    colaborador: {
      include: {
        perfil: { select: { descricao: true; nivel: true } };
        empresa: { select: { razaoSocial: true } };
      };
    };
    gestor: { select: { cracha: true; nome: true } };
  };
}>;
