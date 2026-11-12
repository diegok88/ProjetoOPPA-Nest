/*
  Warnings:

  - The values [INDISPONIVEL] on the enum `CondicaoAlocacao` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "CondicaoAlocacao_new" AS ENUM ('ACEITO', 'RECUSADO', 'AGUARDANDO', 'DISPENSADO', 'INDISPONIBILIDADE');
ALTER TABLE "public"."alocacao_operacional" ALTER COLUMN "condicao" DROP DEFAULT;
ALTER TABLE "alocacao_operacional" ALTER COLUMN "condicao" TYPE "CondicaoAlocacao_new" USING ("condicao"::text::"CondicaoAlocacao_new");
ALTER TYPE "CondicaoAlocacao" RENAME TO "CondicaoAlocacao_old";
ALTER TYPE "CondicaoAlocacao_new" RENAME TO "CondicaoAlocacao";
DROP TYPE "public"."CondicaoAlocacao_old";
ALTER TABLE "alocacao_operacional" ALTER COLUMN "condicao" SET DEFAULT 'AGUARDANDO';
COMMIT;
