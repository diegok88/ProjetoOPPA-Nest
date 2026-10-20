/*
  Warnings:

  - Added the required column `situacaoDispensa` to the `dispensa` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SituacaoDispensa" AS ENUM ('PENDENTE', 'CANCELADA', 'EXECUCAO', 'FINALIZADA');

-- AlterTable
ALTER TABLE "dispensa" ADD COLUMN     "codigo" SERIAL NOT NULL,
ADD COLUMN     "situacaoDispensa" "SituacaoDispensa" NOT NULL;
