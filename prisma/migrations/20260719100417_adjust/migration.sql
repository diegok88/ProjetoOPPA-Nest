-- AlterTable
ALTER TABLE "usuario" ALTER COLUMN "cracha" DROP DEFAULT;
DROP SEQUENCE "usuario_cracha_seq";

-- CreateTable
CREATE TABLE "ContadorDeCracha" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "contador" INTEGER NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ContadorDeCracha_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ContadorDeCracha_empresaId_key" ON "ContadorDeCracha"("empresaId");
