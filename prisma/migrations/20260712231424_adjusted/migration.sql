/*
  Warnings:

  - You are about to drop the column `gestorId` on the `gestor` table. All the data in the column will be lost.
  - You are about to drop the column `usuarioId` on the `gestor` table. All the data in the column will be lost.
  - Added the required column `operadorId` to the `gestor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `supervisorId` to the `gestor` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "gestor" DROP CONSTRAINT "gestor_usuarioId_fkey";

-- AlterTable
ALTER TABLE "gestor" DROP COLUMN "gestorId",
DROP COLUMN "usuarioId",
ADD COLUMN     "operadorId" TEXT NOT NULL,
ADD COLUMN     "supervisorId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "gestor" ADD CONSTRAINT "gestor_operadorId_fkey" FOREIGN KEY ("operadorId") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gestor" ADD CONSTRAINT "gestor_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
