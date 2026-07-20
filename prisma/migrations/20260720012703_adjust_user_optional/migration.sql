/*
  Warnings:

  - You are about to drop the `ContadorDeCracha` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "usuario" DROP CONSTRAINT "usuario_empresaId_fkey";

-- DropForeignKey
ALTER TABLE "usuario" DROP CONSTRAINT "usuario_perfilId_fkey";

-- AlterTable
ALTER TABLE "usuario" ALTER COLUMN "cracha" DROP NOT NULL,
ALTER COLUMN "nome" DROP NOT NULL,
ALTER COLUMN "dataNascimento" DROP NOT NULL,
ALTER COLUMN "dataAdmissao" DROP NOT NULL,
ALTER COLUMN "perfilId" DROP NOT NULL,
ALTER COLUMN "turno" DROP NOT NULL,
ALTER COLUMN "escala" DROP NOT NULL,
ALTER COLUMN "empresaId" DROP NOT NULL;

-- DropTable
DROP TABLE "ContadorDeCracha";

-- CreateTable
CREATE TABLE "contador_cracha" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "contador" INTEGER NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "contador_cracha_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "contador_cracha_empresaId_key" ON "contador_cracha"("empresaId");

-- AddForeignKey
ALTER TABLE "usuario" ADD CONSTRAINT "usuario_perfilId_fkey" FOREIGN KEY ("perfilId") REFERENCES "perfil"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario" ADD CONSTRAINT "usuario_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresa"("id") ON DELETE SET NULL ON UPDATE CASCADE;
