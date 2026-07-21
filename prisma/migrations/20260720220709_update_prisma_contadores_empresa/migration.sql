-- DropIndex
DROP INDEX "contador_cracha_empresaId_key";

-- AddForeignKey
ALTER TABLE "contador_cracha" ADD CONSTRAINT "contador_cracha_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
