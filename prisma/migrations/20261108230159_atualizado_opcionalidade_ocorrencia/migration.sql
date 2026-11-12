-- DropForeignKey
ALTER TABLE "ocorrencia" DROP CONSTRAINT "ocorrencia_falhaId_fkey";

-- DropForeignKey
ALTER TABLE "ocorrencia" DROP CONSTRAINT "ocorrencia_solucaoId_fkey";

-- DropForeignKey
ALTER TABLE "ocorrencia" DROP CONSTRAINT "ocorrencia_solucionadoId_fkey";

-- AlterTable
ALTER TABLE "ocorrencia" ALTER COLUMN "falhaId" DROP NOT NULL,
ALTER COLUMN "solucaoId" DROP NOT NULL,
ALTER COLUMN "tipoOcorrencia" DROP NOT NULL,
ALTER COLUMN "solucionadoId" DROP NOT NULL,
ALTER COLUMN "dataFinal" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "ocorrencia" ADD CONSTRAINT "ocorrencia_falhaId_fkey" FOREIGN KEY ("falhaId") REFERENCES "falha"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ocorrencia" ADD CONSTRAINT "ocorrencia_solucaoId_fkey" FOREIGN KEY ("solucaoId") REFERENCES "solucoes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ocorrencia" ADD CONSTRAINT "ocorrencia_solucionadoId_fkey" FOREIGN KEY ("solucionadoId") REFERENCES "usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
