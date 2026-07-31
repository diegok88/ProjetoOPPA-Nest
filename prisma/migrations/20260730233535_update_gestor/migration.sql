/*
  Warnings:

  - You are about to drop the column `operadorId` on the `gestor` table. All the data in the column will be lost.
  - You are about to drop the column `supervisorId` on the `gestor` table. All the data in the column will be lost.
  - Added the required column `colaboradorId` to the `gestor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gestorId` to the `gestor` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "gestor" DROP CONSTRAINT "gestor_operadorId_fkey";

-- DropForeignKey
ALTER TABLE "gestor" DROP CONSTRAINT "gestor_supervisorId_fkey";

-- AlterTable
ALTER TABLE "gestor" DROP COLUMN "operadorId",
DROP COLUMN "supervisorId",
ADD COLUMN     "colaboradorId" TEXT NOT NULL,
ADD COLUMN     "gestorId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "gestor" ADD CONSTRAINT "gestor_colaboradorId_fkey" FOREIGN KEY ("colaboradorId") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gestor" ADD CONSTRAINT "gestor_gestorId_fkey" FOREIGN KEY ("gestorId") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
