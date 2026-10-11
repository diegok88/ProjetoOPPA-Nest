/*
  Warnings:

  - Added the required column `empresaId` to the `ativo` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ativo" ADD COLUMN     "codigo" SERIAL NOT NULL,
ADD COLUMN     "empresaId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "ativo" ADD CONSTRAINT "ativo_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
