/*
  Warnings:

  - Added the required column `situacaoPenalidade` to the `penalidade` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SituacaoPenalidade" AS ENUM ('PENDENTE', 'CANCELADA', 'EXECUCAO', 'FINALIZADA');

-- AlterTable
ALTER TABLE "penalidade" ADD COLUMN     "codigo" SERIAL NOT NULL,
ADD COLUMN     "situacaoPenalidade" "SituacaoPenalidade" NOT NULL;
