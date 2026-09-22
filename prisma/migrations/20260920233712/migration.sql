/*
  Warnings:

  - You are about to drop the column `tipoPenalidadeId` on the `penalidade` table. All the data in the column will be lost.
  - Added the required column `tipoPenalidade` to the `penalidade` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "penalidade" DROP COLUMN "tipoPenalidadeId",
ADD COLUMN     "tipoPenalidade" "TipoPenalidade" NOT NULL;
