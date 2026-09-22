-- AlterTable
ALTER TABLE "perfil" ADD COLUMN     "nivel" TEXT;

-- AddForeignKey
ALTER TABLE "ativo" ADD CONSTRAINT "ativo_setorId_fkey" FOREIGN KEY ("setorId") REFERENCES "setores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
