-- CreateTable
CREATE TABLE "EficienciaOperacional" (
    "id" TEXT NOT NULL,
    "codigo" SERIAL NOT NULL,
    "operadorId" TEXT NOT NULL,
    "dataRegistro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "eficProduzindo" INTEGER,
    "eficFalha" INTEGER,
    "eficParada" INTEGER,
    "eficFalta" INTEGER,
    "eficAtraso" INTEGER,
    "eficAntecipado" INTEGER,
    "eficSuspensao" INTEGER,
    "eficAdvertencia" INTEGER,
    "eficOrientacao" INTEGER,
    "eficRecusado" INTEGER,
    "eficAceito" INTEGER,
    "eficErroFalha" INTEGER,
    "eficTempoFalha" INTEGER,
    "eficTempoAtividade" INTEGER,
    "eficOcorCausaOperRes" INTEGER,
    "eficOcorCausaMantRes" INTEGER,
    "eficOcorCausaQualRes" INTEGER,
    "eficOcorOper" INTEGER,
    "eficOcorSup" INTEGER,
    "eficOcorMan" INTEGER,
    "eficCompOper" INTEGER,
    "eficTempEmp" INTEGER,
    "eficTotal" DECIMAL(5,2),
    "statusDispFolg" BOOLEAN NOT NULL DEFAULT false,
    "status" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "EficienciaOperacional_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EficienciaOperacional_codigo_key" ON "EficienciaOperacional"("codigo");

-- AddForeignKey
ALTER TABLE "EficienciaOperacional" ADD CONSTRAINT "EficienciaOperacional_operadorId_fkey" FOREIGN KEY ("operadorId") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
