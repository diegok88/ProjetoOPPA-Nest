import {
  ControleJornada as ControleJornadaModel,
  Prisma,
} from '@/generated/prisma/client';

export type ControleJornada = ControleJornadaModel;

export type ControleJornadaRelacao = Prisma.ControleJornadaGetPayload<{
  include: { colaborador: true };
}>;

export type ControleJornadaListagem = ControleJornada | ControleJornadaRelacao;
