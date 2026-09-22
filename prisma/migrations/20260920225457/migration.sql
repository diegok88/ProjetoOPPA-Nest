/*
  Warnings:

  - Added the required column `ativoId` to the `compentencia_operacional` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "compentencia_operacional" ADD COLUMN     "ativoId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "compentencia_operacional" ADD CONSTRAINT "compentencia_operacional_ativoId_fkey" FOREIGN KEY ("ativoId") REFERENCES "ativo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
