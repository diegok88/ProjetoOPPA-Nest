/*
  Warnings:

  - A unique constraint covering the columns `[empresaId]` on the table `contador_cracha` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "contador_cracha_empresaId_key" ON "contador_cracha"("empresaId");
