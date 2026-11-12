import {
  EstadoAtivo as EstadoAtivoModel,
  Prisma,
} from '@/generated/prisma/client';

export type EstadoAtivo = EstadoAtivoModel;

export type EstadoAtivoRelacao = Prisma.EstadoAtivoGetPayload<{
  include: {
    tagAtivo: true;
    alocacaoOperacional: true;
  };
}>;

export type EstadoAtivoListagem = EstadoAtivo | EstadoAtivoRelacao;
