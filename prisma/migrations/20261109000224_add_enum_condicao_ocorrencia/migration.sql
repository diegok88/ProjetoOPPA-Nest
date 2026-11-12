-- CreateEnum
CREATE TYPE "CondicaoOcorrencia" AS ENUM ('EXECUCAO', 'FINALIZADO');

-- AlterTable
ALTER TABLE "ocorrencia" ADD COLUMN     "condicaoOcorrencia" "CondicaoOcorrencia" NOT NULL DEFAULT 'EXECUCAO';
