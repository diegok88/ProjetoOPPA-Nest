/*
  Warnings:

  - Made the column `transferidoPerfilId` on table `fluxo_ocorrencia` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "fluxo_ocorrencia" DROP CONSTRAINT "fluxo_ocorrencia_transferidoPerfilId_fkey";

-- DropForeignKey
ALTER TABLE "fluxo_ocorrencia" DROP CONSTRAINT "fluxo_ocorrencia_usuarioId_fkey";

-- AlterTable
ALTER TABLE "fluxo_ocorrencia" ALTER COLUMN "usuarioId" DROP NOT NULL,
ALTER COLUMN "transferidoPerfilId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "fluxo_ocorrencia" ADD CONSTRAINT "fluxo_ocorrencia_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fluxo_ocorrencia" ADD CONSTRAINT "fluxo_ocorrencia_transferidoPerfilId_fkey" FOREIGN KEY ("transferidoPerfilId") REFERENCES "perfil"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
