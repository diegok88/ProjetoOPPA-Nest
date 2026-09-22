/*
  Warnings:

  - You are about to drop the `CompetenciaSetorial` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Setores` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "CompetenciaSetorial";

-- DropTable
DROP TABLE "Setores";

-- CreateTable
CREATE TABLE "setores" (
    "id" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "setores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "competencia_setorial" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "setorId" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "competencia_setorial_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "setores" ADD CONSTRAINT "setores_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competencia_setorial" ADD CONSTRAINT "competencia_setorial_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competencia_setorial" ADD CONSTRAINT "competencia_setorial_setorId_fkey" FOREIGN KEY ("setorId") REFERENCES "setores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
