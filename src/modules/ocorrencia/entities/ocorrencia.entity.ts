import {
  Ocorrencia as OcorrenciaModel,
  Prisma,
} from '@/generated/prisma/client';

export type Ocorrencia = OcorrenciaModel;

export type OcorrenciaRelacao = Prisma.OcorrenciaGetPayload<{
  include: {
    estadoAtivo: {
      include: { alocacaoOperacional: { include: { operador: true } } };
    };
    falhas: true;
    solucoes: true;
    solucionado: true;
  };
}>;

export type OcorrenciaListagem = Ocorrencia | OcorrenciaRelacao;
