/*
  Warnings:

  - You are about to drop the column `usuarioId` on the `competencia_setorial` table. All the data in the column will be lost.
  - Added the required column `colaboradorId` to the `competencia_setorial` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gestorId` to the `competencia_setorial` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "competencia_setorial" DROP CONSTRAINT "competencia_setorial_usuarioId_fkey";

-- AlterTable
ALTER TABLE "competencia_setorial" DROP COLUMN "usuarioId",
ADD COLUMN     "colaboradorId" TEXT NOT NULL,
ADD COLUMN     "gestorId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "competencia_setorial" ADD CONSTRAINT "competencia_setorial_colaboradorId_fkey" FOREIGN KEY ("colaboradorId") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competencia_setorial" ADD CONSTRAINT "competencia_setorial_gestorId_fkey" FOREIGN KEY ("gestorId") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
