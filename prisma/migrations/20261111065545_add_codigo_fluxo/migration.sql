/*
  Warnings:

  - You are about to drop the column `duracao` on the `fluxo_ocorrencia` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "fluxo_ocorrencia" DROP COLUMN "duracao",
ADD COLUMN     "codigo" SERIAL NOT NULL;
