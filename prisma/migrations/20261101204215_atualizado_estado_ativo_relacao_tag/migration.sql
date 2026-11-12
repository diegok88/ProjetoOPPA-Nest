-- AddForeignKey
ALTER TABLE "estado_ativo" ADD CONSTRAINT "estado_ativo_tagAtivoId_fkey" FOREIGN KEY ("tagAtivoId") REFERENCES "tag_ativo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
