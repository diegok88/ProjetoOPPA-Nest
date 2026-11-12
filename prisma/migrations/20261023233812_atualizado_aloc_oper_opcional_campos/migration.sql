-- DropForeignKey
ALTER TABLE "alocacao_operacional" DROP CONSTRAINT "alocacao_operacional_gestorId_fkey";

-- DropForeignKey
ALTER TABLE "alocacao_operacional" DROP CONSTRAINT "alocacao_operacional_operadorId_fkey";

-- AlterTable
ALTER TABLE "alocacao_operacional" ALTER COLUMN "gestorId" DROP NOT NULL,
ALTER COLUMN "operadorId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "alocacao_operacional" ADD CONSTRAINT "alocacao_operacional_operadorId_fkey" FOREIGN KEY ("operadorId") REFERENCES "usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alocacao_operacional" ADD CONSTRAINT "alocacao_operacional_gestorId_fkey" FOREIGN KEY ("gestorId") REFERENCES "usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
