-- CreateTable
CREATE TABLE "Setores" (
    "id" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL,

    CONSTRAINT "Setores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompetenciaSetorial" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "setorId" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL,

    CONSTRAINT "CompetenciaSetorial_pkey" PRIMARY KEY ("id")
);
