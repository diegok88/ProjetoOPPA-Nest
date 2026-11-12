-- AlterTable
ALTER TABLE "ocorrencia" ADD COLUMN     "dataFalhaRegistrado" TIMESTAMP(3),
ADD COLUMN     "statusFalha" BOOLEAN NOT NULL DEFAULT false;
