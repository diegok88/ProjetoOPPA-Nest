import { Prisma, StatusSolicitacao } from '@/generated/prisma/client';
import { perfilEm, PerfilRef, Role, ROLES } from '@/auth/guards/roles.const';
/* TYPE-ONLY: apagado na compilação — evita ciclo em runtime com o DTO. */
import type { QuerySolicitacoesFilterDto } from '../dto/query-solicitacoes.dto';

/* ==================== INCLUDE FIXO ==================== */
export const INCLUDE_RELACOES = {
  solicitante: true,
  solicitado: true,
  tagAtivo: true,
  tipoSolicitacao: true,
} satisfies Prisma.SolicitacoesInclude;

/* ==================== CONSULTAS ==================== */
export type ConsultaConfig = Omit<
  Prisma.SolicitacoesFindManyArgs,
  'where' | 'skip' | 'take' | 'cursor'
>;

export const CONSULTAS = {
  solicitacao_padrao: {
    orderBy: [{ situacao: 'asc' }, { dataEnvio: 'desc' }],
  },

  solicitacao_pendentes: {
    orderBy: [{ dataEnvio: 'asc' }],
    include: {
      solicitante: { select: { id: true, cracha: true, nome: true } },
      tipoSolicitacao: true,
      tagAtivo: true,
    },
  },

  solicitacao_completo: {
    orderBy: [{ dataEnvio: 'desc' }],
    include: {
      solicitante: true,
      solicitado: true,
      tagAtivo: true,
      tipoSolicitacao: true,
    },
  },

  /**
   * HISTÓRICO — mais recente primeiro, todas as relações.
   * Sem filtro de situação: o recorte vem de `desvios`.
   */
  solicitacao_historico: {
    orderBy: [{ dataEnvio: 'desc' }, { id: 'desc' }],
    include: INCLUDE_RELACOES,
  },

  /** HISTÓRICO enxuto — só as colunas que a tabela do front exibe. */
  solicitacao_historico_resumido: {
    orderBy: [{ dataEnvio: 'desc' }, { id: 'desc' }],
    select: {
      id: true,
      situacao: true,
      observacao: true,
      dataEnvio: true,
      dataVisualizacao: true,
      dataResposta: true,
      solicitante: { select: { id: true, cracha: true, nome: true } },
      solicitado: { select: { id: true, cracha: true, nome: true } },
      tipoSolicitacao: { select: { id: true, descricao: true } },
      tagAtivo: { select: { id: true, descricao: true } },
    },
  },
} satisfies Record<string, ConsultaConfig>;

export type ConsultaSolicitacoes = keyof typeof CONSULTAS;

/* ==================== DESVIOS ==================== */
export const DESVIOS = {
  pendentes: (): Prisma.SolicitacoesWhereInput => ({
    situacao: StatusSolicitacao.PENDENTE,
  }),

  aguardandoVisualizacao: (): Prisma.SolicitacoesWhereInput => ({
    situacao: StatusSolicitacao.PENDENTE,
    dataVisualizacao: null,
  }),

  respondidas: (): Prisma.SolicitacoesWhereInput => ({
    situacao: {
      in: [StatusSolicitacao.ACEITA, StatusSolicitacao.RECUSADA],
    },
  }),

  encerradas: (): Prisma.SolicitacoesWhereInput => ({
    situacao: {
      in: [
        StatusSolicitacao.ACEITA,
        StatusSolicitacao.RECUSADA,
        StatusSolicitacao.CANCELADA,
      ],
    },
  }),

  canceladas: (): Prisma.SolicitacoesWhereInput => ({
    situacao: StatusSolicitacao.CANCELADA,
  }),

  semTipo: (): Prisma.SolicitacoesWhereInput => ({
    tipoSolicitacaoId: null,
  }),
} satisfies Record<string, () => Prisma.SolicitacoesWhereInput>;

export type RecorteSolicitacoes = keyof typeof DESVIOS;

/* ==================== ORDENAÇÃO (whitelist) ==================== */
export const CAMPOS_ORDENACAO = [
  'dataEnvio',
  'dataVisualizacao',
  'dataResposta',
] as const;
export type CampoOrdenacao = (typeof CAMPOS_ORDENACAO)[number];

export const ORDENS = ['asc', 'desc'] as const;
export type Ordem = (typeof ORDENS)[number];

/* ==================== DATAS ==================== */

const MS_POR_DIA = 24 * 60 * 60 * 1000;

/**
 * Brasília não tem mais horário de verão desde 2019: offset fixo UTC-3.
 * Se algum dia voltar, este é o único ponto a mudar.
 */
const OFFSET_BRASILIA_MS = 3 * 60 * 60 * 1000;

const REGEX_SO_DATA = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Normaliza `Date` ou string em `Date` válido, ou `null`.
 * `'YYYY-MM-DD'` é lido como MEIO-DIA UTC de propósito: assim a data
 * cai no dia correto em Brasília mesmo com o servidor rodando em UTC.
 * Sem isso, `'2026-11-22'` viraria 21/11 21:00 em Brasília.
 */
export function comoData(valor: Date | string | null | undefined): Date | null {
  if (valor === null || valor === undefined) return null;

  if (valor instanceof Date) {
    return Number.isNaN(valor.getTime()) ? null : valor;
  }

  if (typeof valor !== 'string') return null;

  const limpo = valor.trim();
  if (!limpo) return null;

  const normalizado = REGEX_SO_DATA.test(limpo)
    ? `${limpo}T12:00:00.000Z`
    : limpo;

  const data = new Date(normalizado);
  return Number.isNaN(data.getTime()) ? null : data;
}

/**
 * Limites [início, fim] do dia da referência, no fuso de Brasília.
 * `inicio` = 00:00:00.000 BRT · `fim` = 23:59:59.999 BRT.
 */
export function limitesDoDiaBrasilia(referencia: Date | string = new Date()): {
  inicio: Date;
  fim: Date;
} {
  const ref = comoData(referencia) ?? new Date();

  /* Desloca para o "horário local" de Brasília e lê os componentes em UTC. */
  const local = new Date(ref.getTime() - OFFSET_BRASILIA_MS);

  const meiaNoiteLocalUtc = Date.UTC(
    local.getUTCFullYear(),
    local.getUTCMonth(),
    local.getUTCDate(),
    0,
    0,
    0,
    0,
  );

  const inicio = new Date(meiaNoiteLocalUtc + OFFSET_BRASILIA_MS);
  const fim = new Date(inicio.getTime() + MS_POR_DIA - 1);

  return { inicio, fim };
}

/* ==================== JANELA DO DIA ==================== */

/**
 * Recorte fixo do dia corrente em Brasília.
 * Aplicado em toda consulta de histórico — a tela não abre mão dele.
 * `referencia` existe para testar outra data, não para o runtime.
 */
export function janelaDoDia(
  referencia: Date | string = new Date(),
): Prisma.SolicitacoesWhereInput {
  const { inicio, fim } = limitesDoDiaBrasilia(referencia);

  return { dataEnvio: { gte: inicio, lte: fim } };
}

/* ==================== ESCOPO ==================== */

/**
 * Escopo da caixa. O operador vem do `usuarioId` quando informado;
 * caso contrário, é derivado dos IDs que já chegam na query.
 */
export function resolverEscopoCaixa(
  filtros: QuerySolicitacoesFilterDto,
  usuarioId?: string,
): Prisma.SolicitacoesWhereInput {
  const operador =
    usuarioId || filtros.solicitanteId || filtros.solicitadoId || undefined;

  if (!operador) return {};

  if (filtros.caixa === 'enviadas') return { solicitanteId: operador };
  if (filtros.caixa === 'recebidas') return { solicitadoId: operador };

  return {
    OR: [{ solicitadoId: operador }, { solicitanteId: operador }],
  };
}

/* ==================== CONDIÇÃO DE DATA ==================== */

/**
 * UMA única chave `dataEnvio`, SEMPRE com `Date` — nunca string.
 *
 * Regra: a janela do dia é o piso. Um período explícito só pode ESTREITAR
 * dentro dela, jamais ampliar. Datas inválidas são descartadas em vez de
 * irem cruas para o Prisma (que rejeita com "premature end of input").
 */
export function condicaoData(
  filtros: QuerySolicitacoesFilterDto,
): Prisma.SolicitacoesWhereInput {
  const janela = limitesDoDiaBrasilia();

  const inicioBruto = comoData(filtros.dataEnvio ?? null);
  const fimBruto = comoData(filtros.dataEnvioAte ?? null);

  const inicioPedido = inicioBruto
    ? limitesDoDiaBrasilia(inicioBruto).inicio
    : janela.inicio;

  const fimPedido = fimBruto ? limitesDoDiaBrasilia(fimBruto).fim : janela.fim;

  /* Intersecção: nunca menor que a janela, nunca maior. */
  const gte =
    inicioPedido.getTime() > janela.inicio.getTime()
      ? inicioPedido
      : janela.inicio;

  const lte =
    fimPedido.getTime() < janela.fim.getTime() ? fimPedido : janela.fim;

  return { dataEnvio: { gte, lte } };
}

/* ==================== MONTAGEM ==================== */

export function toAssembleCondicao(
  filtros: QuerySolicitacoesFilterDto,
  usuarioId?: string,
): Prisma.SolicitacoesWhereInput {
  const and: Prisma.SolicitacoesWhereInput[] = [
    resolverEscopoCaixa(filtros, usuarioId),
    condicaoData(filtros),
  ];

  if (filtros.solicitanteId) and.push({ solicitanteId: filtros.solicitanteId });
  if (filtros.solicitadoId) and.push({ solicitadoId: filtros.solicitadoId });
  if (filtros.tagAtivoId) and.push({ tagAtivoId: filtros.tagAtivoId });
  if (filtros.tipoSolicitacaoId) {
    and.push({ tipoSolicitacaoId: filtros.tipoSolicitacaoId });
  }

  /* Situação única tem precedência sobre a lista */
  if (filtros.situacao) {
    and.push({ situacao: filtros.situacao });
  } else if (filtros.situacoes?.length) {
    and.push({ situacao: { in: filtros.situacoes } });
  }

  if (filtros.apenasNaoVisualizadas) and.push({ dataVisualizacao: null });
  if (filtros.apenasComResposta) and.push({ dataResposta: { not: null } });

  /* Datas opcionais: convertidas antes de ir ao Prisma. */
  const dataVisualizacao = comoData(filtros.dataVisualizacao ?? null);
  if (dataVisualizacao) {
    and.push({ dataVisualizacao: { lte: dataVisualizacao } });
  }

  const dataResposta = comoData(filtros.dataResposta ?? null);
  if (dataResposta) {
    and.push({ dataResposta: { lte: dataResposta } });
  }

  if (filtros.status !== undefined) and.push({ status: filtros.status });

  /* Busca textual */
  const busca = filtros.busca?.trim();
  if (busca) {
    and.push({
      OR: [
        { observacao: { contains: busca, mode: 'insensitive' } },
        { solicitante: { nome: { contains: busca, mode: 'insensitive' } } },
        { solicitado: { nome: { contains: busca, mode: 'insensitive' } } },
        { tagAtivo: { descricao: { contains: busca, mode: 'insensitive' } } },
      ],
    });
  }

  return { AND: and.filter((c) => Object.keys(c).length > 0) };
}

export function resolverConfig(
  consulta?: ConsultaSolicitacoes,
): ConsultaConfig {
  return consulta ? CONSULTAS[consulta] : CONSULTAS.solicitacao_padrao;
}

export function resolverOrdination(
  query: QuerySolicitacoesFilterDto,
  config: ConsultaConfig,
): Prisma.SolicitacoesFindManyArgs['orderBy'] {
  const campo = query.ordenarPor;

  if (!campo || !(CAMPOS_ORDENACAO as readonly string[]).includes(campo)) {
    return config.orderBy;
  }

  const direcao: Prisma.SortOrder = query.ordem === 'asc' ? 'asc' : 'desc';

  return [
    { [campo as CampoOrdenacao]: direcao },
    { id: 'desc' },
  ] as Prisma.SolicitacoesOrderByWithRelationInput[];
}

export function toAssembleQuery(
  query: QuerySolicitacoesFilterDto,
  usuarioId?: string,
): Prisma.SolicitacoesFindManyArgs {
  const config = resolverConfig(query.consulta);
  const desvio = query.desvios ? DESVIOS[query.desvios]() : undefined;
  const filtros = toAssembleCondicao(query, usuarioId);

  return {
    ...config,
    orderBy: resolverOrdination(query, config),
    where: desvio ? { AND: [desvio, filtros] } : filtros,
  };
}

/* ==================== REGRAS DE TRANSIÇÃO ==================== */
export type AcaoSolicitacao = 'ACEITAR' | 'RECUSAR' | 'CANCELAR' | 'REABRIR';
export type AtorSolicitacao = 'SOLICITANTE' | 'SOLICITADO' | 'GESTAO';

export interface RegraAcao {
  de: StatusSolicitacao[];
  para: StatusSolicitacao;
  ator: AtorSolicitacao;
}

export const REGRAS: Record<AcaoSolicitacao, RegraAcao> = {
  ACEITAR: {
    de: [StatusSolicitacao.PENDENTE],
    para: StatusSolicitacao.ACEITA,
    ator: 'SOLICITADO',
  },
  RECUSAR: {
    de: [StatusSolicitacao.PENDENTE],
    para: StatusSolicitacao.RECUSADA,
    ator: 'SOLICITADO',
  },
  CANCELAR: {
    de: [StatusSolicitacao.PENDENTE],
    para: StatusSolicitacao.CANCELADA,
    ator: 'SOLICITANTE',
  },
  REABRIR: {
    de: [StatusSolicitacao.RECUSADA, StatusSolicitacao.CANCELADA],
    para: StatusSolicitacao.PENDENTE,
    ator: 'GESTAO',
  },
};

/* ==================== REGRAS DE NEGÓCIO ==================== */
export const PERFIS_RECEPTORES: readonly Role[] = [
  ROLES.SUP1,
  ROLES.GER1,
  ROLES.ADN1,
  ROLES.OPE1,
];

export function ehPerfilReceptor(perfil: PerfilRef): boolean {
  if (!perfil) return false;
  if (typeof perfil !== 'string' && perfil.status === false) return false;
  return perfilEm(perfil, PERFIS_RECEPTORES);
}

export const LIMITE_PENDENTES = 5;
export const LIMITE_LISTA_COMPLETA = 500;
export const OBSERVACAO_MAX = 1000;

/* ==================== CONTADOR ==================== */
export type ContadorSolicitacoes = {
  recebidas: {
    pendentes: number;
    aceitas: number;
    recusadas: number;
    canceladas: number;
  };
  enviadas: {
    pendentes: number;
    aceitas: number;
    recusadas: number;
    canceladas: number;
  };
  naoVisualizadas: number;
};
