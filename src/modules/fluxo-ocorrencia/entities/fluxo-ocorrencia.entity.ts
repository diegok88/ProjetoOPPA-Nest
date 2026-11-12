import {
  FluxoOcorrencia as FluxoOcorrenciaModel,
  Prisma,
} from '@/generated/prisma/client';

export type FluxoOcorrencia = FluxoOcorrenciaModel;

export type FluxoOcorrenciaRelacao = Prisma.FluxoOcorrenciaGetPayload<{
  include: {
    ocorrencia: true;
    usuario: true;
    transferidoPerfil: true;
  };
}>;

export type FluxoOcorrenciaListagem = FluxoOcorrencia | FluxoOcorrenciaRelacao;
