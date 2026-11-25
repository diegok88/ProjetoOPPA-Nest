import {
  Solicitacoes as SolicitacoesModel,
  Prisma,
} from '@/generated/prisma/client';

export type Solicitacoes = SolicitacoesModel;

export type SolicitacoesRelacoes = Prisma.SolicitacoesGetPayload<{
  include: {
    solicitante: true;
    solicitado: true;
    tagAtivo: true;
    tipoSolicitacao: true;
  };
}>;

export type SolicitacoesListagem = Solicitacoes | SolicitacoesRelacoes;
