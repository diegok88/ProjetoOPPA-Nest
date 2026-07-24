/*
  Warnings:

  - Added the required column `empresaId` to the `auditoria` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "auditoria" ADD COLUMN     "empresaId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "auditoria" ADD CONSTRAINT "auditoria_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
