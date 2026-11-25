-- DropForeignKey
ALTER TABLE "solicitacoes" DROP CONSTRAINT "solicitacoes_solicitanteId_fkey";

-- DropForeignKey
ALTER TABLE "solicitacoes" DROP CONSTRAINT "solicitacoes_tipoSolicitacaoId_fkey";

-- AlterTable
ALTER TABLE "solicitacoes" ADD COLUMN     "tagAtivoId" TEXT,
ALTER COLUMN "solicitanteId" DROP NOT NULL,
ALTER COLUMN "tipoSolicitacaoId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "solicitacoes" ADD CONSTRAINT "solicitacoes_solicitanteId_fkey" FOREIGN KEY ("solicitanteId") REFERENCES "usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitacoes" ADD CONSTRAINT "solicitacoes_tagAtivoId_fkey" FOREIGN KEY ("tagAtivoId") REFERENCES "tag_ativo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitacoes" ADD CONSTRAINT "solicitacoes_tipoSolicitacaoId_fkey" FOREIGN KEY ("tipoSolicitacaoId") REFERENCES "tipo_solicitacao"("id") ON DELETE SET NULL ON UPDATE CASCADE;
