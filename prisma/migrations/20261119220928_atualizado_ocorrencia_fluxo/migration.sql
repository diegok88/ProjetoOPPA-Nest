-- AlterTable
ALTER TABLE "fluxo_ocorrencia" ALTER COLUMN "dataInicial" DROP NOT NULL,
ALTER COLUMN "dataInicial" DROP DEFAULT;

-- AlterTable
ALTER TABLE "ocorrencia" ADD COLUMN     "duracaoFalhaRegistrado" INTEGER;
