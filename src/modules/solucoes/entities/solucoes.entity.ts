import { Prisma, Solucoes as SolucoesModel } from '@/generated/prisma/client';

export type Solucoes = SolucoesModel;

export type SolucoesRelacoes = Prisma.SolucoesGetPayload<{
  include: { perfil: true; falha: true };
}>;

export type SolucoesRelacoesParcial = Prisma.SolucoesGetPayload<{
  include: {
    perfil: { select: { codigo: true; descricao: true } };
    falha: { select: { codigo: true; descricao: true } };
  };
}>;

export type SolucoesComPerfil = Prisma.SolucoesGetPayload<{
  include: { perfil: true };
}>;

export type SolucoesComFalha = Prisma.SolucoesGetPayload<{
  include: { falha: true };
}>;

export type SolucoesPerfilParcial = Prisma.SolucoesGetPayload<{
  include: { perfil: { select: { descricao: true; nivel: true } } };
}>;

export type SolucoesFalhaParcial = Prisma.SolucoesGetPayload<{
  include: { falha: { select: { codigo: true; descricao: true } } };
}>;

export type SolucoesListagem =
  | Solucoes
  | SolucoesRelacoes
  | SolucoesRelacoesParcial
  | SolucoesComPerfil
  | SolucoesComFalha
  | SolucoesPerfilParcial
  | SolucoesFalhaParcial;
