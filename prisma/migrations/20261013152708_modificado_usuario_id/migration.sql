/*
  Warnings:

  - You are about to drop the column `usuarioId` on the `dispensa` table. All the data in the column will be lost.
  - Added the required column `colaboradorId` to the `dispensa` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "dispensa" DROP CONSTRAINT "dispensa_usuarioId_fkey";

-- AlterTable
ALTER TABLE "dispensa" DROP COLUMN "usuarioId",
ADD COLUMN     "colaboradorId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "dispensa" ADD CONSTRAINT "dispensa_colaboradorId_fkey" FOREIGN KEY ("colaboradorId") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
