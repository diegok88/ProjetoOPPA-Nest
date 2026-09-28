import { Usuario as UsuarioModel, Prisma } from '@/generated/prisma/client';

export type Usuario = UsuarioModel;

export type UsuarioRelacao = Prisma.UsuarioGetPayload<{
  include: {
    perfil: { select: { descricao: true; nivel: true } };
    empresa: { select: { razaoSocial: true } };
    gestorComoColaborador: {
      select: { id: true; gestor: { select: { nome: true; cracha: true } } };
    };
  };
}>;
