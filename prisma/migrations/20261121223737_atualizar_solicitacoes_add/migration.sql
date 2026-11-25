-- CreateEnum
CREATE TYPE "StatusSolicitacao" AS ENUM ('PENDENTE', 'ACEITA', 'RECUSADA', 'CANCELADA');

-- AlterTable
ALTER TABLE "solicitacoes" ADD COLUMN     "dataResposta" TIMESTAMP(3),
ADD COLUMN     "situacao" "StatusSolicitacao" NOT NULL DEFAULT 'PENDENTE',
ALTER COLUMN "dataEnvio" SET DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "solicitacoes_solicitadoId_situacao_idx" ON "solicitacoes"("solicitadoId", "situacao");

-- CreateIndex
CREATE INDEX "solicitacoes_solicitanteId_situacao_idx" ON "solicitacoes"("solicitanteId", "situacao");

-- CreateIndex
CREATE INDEX "solicitacoes_solicitadoId_situacao_dataVisualizacao_idx" ON "solicitacoes"("solicitadoId", "situacao", "dataVisualizacao");

-- CreateIndex
CREATE INDEX "solicitacoes_tagAtivoId_situacao_idx" ON "solicitacoes"("tagAtivoId", "situacao");
