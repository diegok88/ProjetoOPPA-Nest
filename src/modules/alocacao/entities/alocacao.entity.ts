import {
  AlocacaoOperacional as AlocacaoOperacionalModel,
  Prisma,
} from '@/generated/prisma/client';

export type AlocacaoOperacional = AlocacaoOperacionalModel;

export type AlocacaoOperacionalRelacao = Prisma.AlocacaoOperacionalGetPayload<{
  include: {
    operador: true;
    gestor: true;
    tagAtivo: { include: { ativo: true } };
  };
}>;

export type AlocacaoOperacionalRelacaoParcial =
  Prisma.AlocacaoOperacionalGetPayload<{
    include: {
      operador: { select: { id: true; cracha: true; nome: true } };
      gestor: { select: { id: true; cracha: true; nome: true } };
      tagAtivo: {
        select: {
          id: true;
          codigo: true;
          descricao: true;
          ativo: {
            include: {
              tagAtivo: {
                select: {
                  id: true;
                  descricao: true;
                  modelo: true;
                  setorId: true;
                };
              };
            };
          };
        };
      };
    };
  }>;

export type AlocacaoListagem =
  | AlocacaoOperacional
  | AlocacaoOperacionalRelacao
  | AlocacaoOperacionalRelacaoParcial;
