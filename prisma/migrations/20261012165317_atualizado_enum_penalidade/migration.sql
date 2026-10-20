/*
  Warnings:

  - The values [SUSPENCAO] on the enum `TipoPenalidade` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TipoPenalidade_new" AS ENUM ('ORIENTACAO', 'ADVERTENCIA', 'SUSPENSAO');
ALTER TABLE "penalidade" ALTER COLUMN "tipoPenalidade" TYPE "TipoPenalidade_new" USING ("tipoPenalidade"::text::"TipoPenalidade_new");
ALTER TYPE "TipoPenalidade" RENAME TO "TipoPenalidade_old";
ALTER TYPE "TipoPenalidade_new" RENAME TO "TipoPenalidade";
DROP TYPE "public"."TipoPenalidade_old";
COMMIT;
