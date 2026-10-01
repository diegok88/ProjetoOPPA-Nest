/*
  Warnings:

  - Added the required column `turno` to the `competencia_setorial` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "competencia_setorial" ADD COLUMN     "turno" "TipoTurno" NOT NULL;
