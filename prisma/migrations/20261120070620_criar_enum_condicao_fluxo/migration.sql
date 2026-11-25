-- CreateEnum
CREATE TYPE "CondicaoFluxo" AS ENUM ('EXECUCAO', 'FINALIZADO');

-- AlterTable
ALTER TABLE "fluxo_ocorrencia" ADD COLUMN     "condicaoFluxo" "CondicaoFluxo" DEFAULT 'EXECUCAO';
