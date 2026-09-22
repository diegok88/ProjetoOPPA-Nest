/*
  Warnings:

  - Made the column `nivel` on table `perfil` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "perfil" ALTER COLUMN "nivel" SET NOT NULL;
