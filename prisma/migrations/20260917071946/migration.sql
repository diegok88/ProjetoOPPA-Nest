/*
  Warnings:

  - Added the required column `empresaId` to the `Setores` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Setores" ADD COLUMN     "empresaId" TEXT NOT NULL;
