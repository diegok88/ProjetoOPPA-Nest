import { Empresa as EmpresaModel, Prisma } from '@/generated/prisma/client';

export type Empresa = EmpresaModel;

export type EmpresaRelacao = Prisma.EmpresaGetPayload<{
  include: {
    contadorCracha: true;
  };
}>;

