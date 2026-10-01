-- AlterTable
ALTER TABLE "usuario" ADD COLUMN     "cpf" TEXT,
ADD COLUMN     "versaoToken" INTEGER NOT NULL DEFAULT 0;
