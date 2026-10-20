/*
  Warnings:

  - You are about to drop the column `usuarioId` on the `penalidade` table. All the data in the column will be lost.
  - Added the required column `colaboradorId` to the `penalidade` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "penalidade" DROP CONSTRAINT "penalidade_usuarioId_fkey";

-- AlterTable
ALTER TABLE "penalidade" DROP COLUMN "usuarioId",
ADD COLUMN     "colaboradorId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "penalidade" ADD CONSTRAINT "penalidade_colaboradorId_fkey" FOREIGN KEY ("colaboradorId") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
