/*
  Warnings:

  - Made the column `condicaoFluxo` on table `fluxo_ocorrencia` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "fluxo_ocorrencia" ALTER COLUMN "condicaoFluxo" SET NOT NULL;
