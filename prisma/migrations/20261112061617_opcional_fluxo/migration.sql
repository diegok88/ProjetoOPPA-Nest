-- DropForeignKey
ALTER TABLE "fluxo_ocorrencia" DROP CONSTRAINT "fluxo_ocorrencia_transferidoPerfilId_fkey";

-- AlterTable
ALTER TABLE "fluxo_ocorrencia" ALTER COLUMN "transferidoPerfilId" DROP NOT NULL,
ALTER COLUMN "dataFinal" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "fluxo_ocorrencia" ADD CONSTRAINT "fluxo_ocorrencia_transferidoPerfilId_fkey" FOREIGN KEY ("transferidoPerfilId") REFERENCES "perfil"("id") ON DELETE SET NULL ON UPDATE CASCADE;
