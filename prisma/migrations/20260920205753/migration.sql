/*
  Warnings:

  - You are about to drop the column `usuarioId` on the `alocacao_operacional` table. All the data in the column will be lost.
  - You are about to drop the `CompetenciaOperacional` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TagAtivo` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `gestorId` to the `alocacao_operacional` table without a default value. This is not possible if the table is not empty.
  - Added the required column `operadorId` to the `alocacao_operacional` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "CondicaoAlocacao" ADD VALUE 'AGUARDANDO';

-- DropForeignKey
ALTER TABLE "CompetenciaOperacional" DROP CONSTRAINT "CompetenciaOperacional_gestorId_fkey";

-- DropForeignKey
ALTER TABLE "CompetenciaOperacional" DROP CONSTRAINT "CompetenciaOperacional_operadorId_fkey";

-- DropForeignKey
ALTER TABLE "TagAtivo" DROP CONSTRAINT "TagAtivo_ativoId_fkey";

-- AlterTable
ALTER TABLE "alocacao_operacional" DROP COLUMN "usuarioId",
ADD COLUMN     "gestorId" TEXT NOT NULL,
ADD COLUMN     "operadorId" TEXT NOT NULL,
ALTER COLUMN "condicao" SET DEFAULT 'AGUARDANDO';

-- AlterTable
ALTER TABLE "fluxo_ocorrencia" ADD COLUMN     "status" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "penalidade" ALTER COLUMN "justificativa" DROP NOT NULL;

-- DropTable
DROP TABLE "CompetenciaOperacional";

-- DropTable
DROP TABLE "TagAtivo";

-- CreateTable
CREATE TABLE "tag_ativo" (
    "id" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "ativoId" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL,

    CONSTRAINT "tag_ativo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compentencia_operacional" (
    "id" TEXT NOT NULL,
    "operadorId" TEXT NOT NULL,
    "gestorId" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL,

    CONSTRAINT "compentencia_operacional_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "alocacao_operacional" ADD CONSTRAINT "alocacao_operacional_operadorId_fkey" FOREIGN KEY ("operadorId") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alocacao_operacional" ADD CONSTRAINT "alocacao_operacional_gestorId_fkey" FOREIGN KEY ("gestorId") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alocacao_operacional" ADD CONSTRAINT "alocacao_operacional_tagAtivoId_fkey" FOREIGN KEY ("tagAtivoId") REFERENCES "tag_ativo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tag_ativo" ADD CONSTRAINT "tag_ativo_ativoId_fkey" FOREIGN KEY ("ativoId") REFERENCES "ativo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compentencia_operacional" ADD CONSTRAINT "compentencia_operacional_operadorId_fkey" FOREIGN KEY ("operadorId") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compentencia_operacional" ADD CONSTRAINT "compentencia_operacional_gestorId_fkey" FOREIGN KEY ("gestorId") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
