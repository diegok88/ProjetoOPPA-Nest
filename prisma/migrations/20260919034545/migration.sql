-- CreateEnum
CREATE TYPE "TipoPenalidade" AS ENUM ('ORIENTACAO', 'ADVERTENCIA', 'SUSPENCAO');

-- CreateEnum
CREATE TYPE "TipoDispensa" AS ENUM ('BANCO_DE_HORAS', 'FERIAS', 'ATESTADO');

-- CreateEnum
CREATE TYPE "TipoJornada" AS ENUM ('ENTRADA_EXPEDIENTE', 'SAIDA_INTERVALO', 'RETORNO_INTERVALO', 'SAIDA_EXPEDIENTE');

-- CreateEnum
CREATE TYPE "TipoEstadoJornada" AS ENUM ('CONFORME', 'ATRASO', 'FALTA');

-- CreateEnum
CREATE TYPE "CondicaoAlocacao" AS ENUM ('ACEITO', 'RECUSADO');

-- CreateEnum
CREATE TYPE "TipoEstadoAtivo" AS ENUM ('PRODUZINDO', 'PARADA', 'FALHA');

-- CreateEnum
CREATE TYPE "TipoOcorrencia" AS ENUM ('OPERACIONAL', 'MANUTENCAO', 'QUALIDADE');

-- CreateTable
CREATE TABLE "penalidade" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "gestorId" TEXT NOT NULL,
    "tipoPenalidadeId" "TipoPenalidade" NOT NULL,
    "dataInicial" TIMESTAMP(3) NOT NULL,
    "dataFinal" TIMESTAMP(3) NOT NULL,
    "justificativa" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL,

    CONSTRAINT "penalidade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dispensa" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "gestorId" TEXT NOT NULL,
    "tipoDispensa" "TipoDispensa" NOT NULL,
    "dataInicial" TIMESTAMP(3) NOT NULL,
    "dataFinal" TIMESTAMP(3) NOT NULL,
    "status" BOOLEAN NOT NULL,

    CONSTRAINT "dispensa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "controle_jornada" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "tipoJornada" "TipoJornada" NOT NULL,
    "estadoJornada" "TipoEstadoJornada" NOT NULL,
    "dataRegistro" TIMESTAMP(3) NOT NULL,
    "tagAtivoId" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL,

    CONSTRAINT "controle_jornada_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "solicitacoes" (
    "id" TEXT NOT NULL,
    "solicitanteId" TEXT NOT NULL,
    "solicitadoId" TEXT NOT NULL,
    "tipoSolicitacaoId" TEXT NOT NULL,
    "observacao" TEXT,
    "dataEnvio" TIMESTAMP(3) NOT NULL,
    "dataVisualizacao" TIMESTAMP(3),
    "status" BOOLEAN NOT NULL,

    CONSTRAINT "solicitacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tipo_solicitacao" (
    "id" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL,

    CONSTRAINT "tipo_solicitacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alocacao_operacional" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "tagAtivoId" TEXT NOT NULL,
    "condicao" "CondicaoAlocacao" NOT NULL,
    "status" BOOLEAN NOT NULL,

    CONSTRAINT "alocacao_operacional_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "estado_ativo" (
    "id" TEXT NOT NULL,
    "alocacaoId" TEXT NOT NULL,
    "tagAtivoId" TEXT NOT NULL,
    "tipoEstado" "TipoEstadoAtivo" NOT NULL,
    "dataInicial" TIMESTAMP(3) NOT NULL,
    "dataFinal" TIMESTAMP(3),
    "status" BOOLEAN NOT NULL,

    CONSTRAINT "estado_ativo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ocorrencia" (
    "id" TEXT NOT NULL,
    "estadoAtivoId" TEXT NOT NULL,
    "falhaId" TEXT NOT NULL,
    "solucaoId" TEXT NOT NULL,
    "tipoOcorrencia" "TipoOcorrencia" NOT NULL,
    "solucionadoId" TEXT NOT NULL,
    "dataInicial" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataFinal" TIMESTAMP(3) NOT NULL,
    "status" BOOLEAN NOT NULL,

    CONSTRAINT "ocorrencia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fluxo_ocorrencia" (
    "id" TEXT NOT NULL,
    "ocorrenciaId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "transferidoPerfilId" TEXT NOT NULL,
    "dataInicial" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataFinal" TIMESTAMP(3) NOT NULL,
    "duracao" INTEGER NOT NULL,

    CONSTRAINT "fluxo_ocorrencia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ativo" (
    "id" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "modelo" TEXT NOT NULL,
    "fabricante" TEXT NOT NULL,
    "ano" INTEGER NOT NULL,
    "setorId" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL,

    CONSTRAINT "ativo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TagAtivo" (
    "id" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "ativoId" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL,

    CONSTRAINT "TagAtivo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompetenciaOperacional" (
    "id" TEXT NOT NULL,
    "operadorId" TEXT NOT NULL,
    "gestorId" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL,

    CONSTRAINT "CompetenciaOperacional_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "falha" (
    "id" TEXT NOT NULL,
    "codigo" INTEGER NOT NULL,
    "descricao" TEXT NOT NULL,
    "ativoId" TEXT NOT NULL,
    "direcionamentoId" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL,

    CONSTRAINT "falha_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "solucoes" (
    "id" TEXT NOT NULL,
    "falhaId" TEXT NOT NULL,
    "direcionamentoId" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL,

    CONSTRAINT "solucoes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ocorrencia_estadoAtivoId_key" ON "ocorrencia"("estadoAtivoId");

-- AddForeignKey
ALTER TABLE "penalidade" ADD CONSTRAINT "penalidade_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "penalidade" ADD CONSTRAINT "penalidade_gestorId_fkey" FOREIGN KEY ("gestorId") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dispensa" ADD CONSTRAINT "dispensa_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dispensa" ADD CONSTRAINT "dispensa_gestorId_fkey" FOREIGN KEY ("gestorId") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "controle_jornada" ADD CONSTRAINT "controle_jornada_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitacoes" ADD CONSTRAINT "solicitacoes_solicitanteId_fkey" FOREIGN KEY ("solicitanteId") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitacoes" ADD CONSTRAINT "solicitacoes_solicitadoId_fkey" FOREIGN KEY ("solicitadoId") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitacoes" ADD CONSTRAINT "solicitacoes_tipoSolicitacaoId_fkey" FOREIGN KEY ("tipoSolicitacaoId") REFERENCES "tipo_solicitacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "estado_ativo" ADD CONSTRAINT "estado_ativo_alocacaoId_fkey" FOREIGN KEY ("alocacaoId") REFERENCES "alocacao_operacional"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ocorrencia" ADD CONSTRAINT "ocorrencia_estadoAtivoId_fkey" FOREIGN KEY ("estadoAtivoId") REFERENCES "estado_ativo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ocorrencia" ADD CONSTRAINT "ocorrencia_falhaId_fkey" FOREIGN KEY ("falhaId") REFERENCES "falha"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ocorrencia" ADD CONSTRAINT "ocorrencia_solucaoId_fkey" FOREIGN KEY ("solucaoId") REFERENCES "solucoes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ocorrencia" ADD CONSTRAINT "ocorrencia_solucionadoId_fkey" FOREIGN KEY ("solucionadoId") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fluxo_ocorrencia" ADD CONSTRAINT "fluxo_ocorrencia_ocorrenciaId_fkey" FOREIGN KEY ("ocorrenciaId") REFERENCES "ocorrencia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fluxo_ocorrencia" ADD CONSTRAINT "fluxo_ocorrencia_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fluxo_ocorrencia" ADD CONSTRAINT "fluxo_ocorrencia_transferidoPerfilId_fkey" FOREIGN KEY ("transferidoPerfilId") REFERENCES "perfil"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TagAtivo" ADD CONSTRAINT "TagAtivo_ativoId_fkey" FOREIGN KEY ("ativoId") REFERENCES "ativo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetenciaOperacional" ADD CONSTRAINT "CompetenciaOperacional_operadorId_fkey" FOREIGN KEY ("operadorId") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetenciaOperacional" ADD CONSTRAINT "CompetenciaOperacional_gestorId_fkey" FOREIGN KEY ("gestorId") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "falha" ADD CONSTRAINT "falha_ativoId_fkey" FOREIGN KEY ("ativoId") REFERENCES "ativo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "falha" ADD CONSTRAINT "falha_direcionamentoId_fkey" FOREIGN KEY ("direcionamentoId") REFERENCES "perfil"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solucoes" ADD CONSTRAINT "solucoes_falhaId_fkey" FOREIGN KEY ("falhaId") REFERENCES "falha"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solucoes" ADD CONSTRAINT "solucoes_direcionamentoId_fkey" FOREIGN KEY ("direcionamentoId") REFERENCES "perfil"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
