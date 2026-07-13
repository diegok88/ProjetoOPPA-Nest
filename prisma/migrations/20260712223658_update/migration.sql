/*
  Warnings:

  - Added the required column `registradoPorId` to the `auditoria` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "auditoria" ADD COLUMN     "registradoPorId" TEXT NOT NULL;

-- DropEnum
DROP TYPE "Entidade";

-- CreateIndex
CREATE INDEX "auditoria_registroId_idx" ON "auditoria"("registroId");

-- CreateIndex
CREATE INDEX "auditoria_dataHora_idx" ON "auditoria"("dataHora");

-- AddForeignKey
ALTER TABLE "auditoria" ADD CONSTRAINT "auditoria_registradoPorId_fkey" FOREIGN KEY ("registradoPorId") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
