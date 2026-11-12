/*
  Warnings:

  - Added the required column `duracao` to the `fluxo_ocorrencia` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "fluxo_ocorrencia" ADD COLUMN     "duracao" INTEGER NOT NULL;
