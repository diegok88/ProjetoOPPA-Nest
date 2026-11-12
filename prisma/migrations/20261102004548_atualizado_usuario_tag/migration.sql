/*
  Warnings:

  - You are about to drop the column `cpf` on the `usuario` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "usuario" DROP COLUMN "cpf",
ADD COLUMN     "tagAtivoId" TEXT;

-- AddForeignKey
ALTER TABLE "usuario" ADD CONSTRAINT "usuario_tagAtivoId_fkey" FOREIGN KEY ("tagAtivoId") REFERENCES "tag_ativo"("id") ON DELETE SET NULL ON UPDATE CASCADE;
