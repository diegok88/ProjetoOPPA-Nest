import { Usuario as UsuarioModel, Prisma } from '@/generated/prisma/client';

export type Usuario = UsuarioModel;

export type UsuarioRelacoes = Prisma.UsuarioGetPayload<{
  include: {
    perfil: true;
    empresa: true;
    gestorComoColaborador: { include: { gestor: true } };
  };
}>;

export type UsuarioRelacoesParcial = Prisma.UsuarioGetPayload<{
  include: {
    perfil: { select: { descricao: true; nivel: true } };
    empresa: { select: { razaoSocial: true } };
    gestorComoColaborador: {
      select: { id: true; gestor: { select: { nome: true; cracha: true } } };
    };
  };
}>;

export type UsuarioComPerfil = Prisma.UsuarioGetPayload<{
  include: { perfil: true };
}>;

export type UsuarioComEmpresa = Prisma.UsuarioGetPayload<{
  include: { empresa: true };
}>;

export type UsuarioComGestor = Prisma.UsuarioGetPayload<{
  include: { gestorComoColaborador: { include: { gestor: true } } };
}>;

export type UsuarioPerfilParcial = Prisma.UsuarioGetPayload<{
  include: { perfil: { select: { descricao: true; nivel: true } } };
}>;

export type UsuarioEmpresaParcial = Prisma.UsuarioGetPayload<{
  include: { empresa: { select: { razaoSocial: true } } };
}>;

export type UsuarioGestorParcial = Prisma.UsuarioGetPayload<{
  include: {
    gestorComoColaborador: {
      select: { id: true; gestor: { select: { nome: true; cracha: true } } };
    };
  };
}>;

export type UsuarioListagem =
  | Usuario
  | UsuarioRelacoes
  | UsuarioRelacoesParcial
  | UsuarioComPerfil
  | UsuarioComEmpresa
  | UsuarioComGestor
  | UsuarioPerfilParcial
  | UsuarioEmpresaParcial
  | UsuarioGestorParcial;
