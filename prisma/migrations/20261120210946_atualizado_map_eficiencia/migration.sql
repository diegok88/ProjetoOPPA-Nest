/*
  Warnings:

  - You are about to drop the `EficienciaOperacional` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "EficienciaOperacional" DROP CONSTRAINT "EficienciaOperacional_operadorId_fkey";

-- DropTable
DROP TABLE "EficienciaOperacional";

-- CreateTable
CREATE TABLE "eficiencia_operacional" (
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

    CONSTRAINT "eficiencia_operacional_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "eficiencia_operacional_codigo_key" ON "eficiencia_operacional"("codigo");

-- AddForeignKey
ALTER TABLE "eficiencia_operacional" ADD CONSTRAINT "eficiencia_operacional_operadorId_fkey" FOREIGN KEY ("operadorId") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
