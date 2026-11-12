/*
  Warnings:

  - Added the required column `turno` to the `alocacao_operacional` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "alocacao_operacional" ADD COLUMN     "turno" "TipoTurno" NOT NULL;
