-- AlterTable
ALTER TABLE "competencia_setorial" ADD COLUMN     "ativadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "inativadoEm" TIMESTAMP(3);
