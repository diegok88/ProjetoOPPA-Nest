/* =====================================================================
   DATA-BRASILIA.UTIL
   Utilitários de data centralizados no fuso de Brasília.
   Garante que TODA a lógica de jornada (turnos, intervalos, filtros de
   consulta) trate horários locais de Brasília de forma consistente,
   independentemente do fuso onde o servidor está rodando.
   ===================================================================== */

/* FUSO OFICIAL DE BRASÍLIA: identificador IANA usado pelo Intl.DateTimeFormat */
const FUSO_BRASILIA = 'America/Sao_Paulo';

/* FORMATO DE DATA ESPERADO: "yyyy-mm-dd" (ex.: filtro de API "2026-11-06") */
const FORMATO_DATA = /^\d{4}-\d{2}-\d{2}$/;

/* FUNÇÃO AUXILIAR - EXTRAIR AS PARTES LOCAIS DE BRASÍLIA DE UM INSTANTE
   Todo Date guarda internamente um instante absoluto em UTC. Esta função
   "traduz" esse instante para o relógio de Brasília e é o ÚNICO ponto do
   arquivo onde a conversão UTC -> Brasília acontece. Retorna um objeto
   simples de números, pronto para ser consumido pelas demais funções. */
export function partesBrasilia(data: Date): {
  ano: number;
  mes: number;
  dia: number;
  hora: number;
  minuto: number;
  segundo: number;
} {
  /* Formatador com timeZone fixo: mesmo resultado em qualquer servidor/região */
  const formatador = new Intl.DateTimeFormat('en-US', {
    timeZone: FUSO_BRASILIA,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  /* formatToParts devolve cada campo separado, evitando parsing frágil
     de string formatada (ex.: "11/06/2026, 22:00:00") */
  const partes = formatador.formatToParts(data);

  /* Busca segura: se o tipo de parte não vier no resultado,
     retorna 0 como fallback em vez de gerar NaN ou crashar */
  const buscar = (tipo: string) =>
    Number(partes.find((p) => p.type === tipo)?.value ?? 0);

  /* EDGE CASE: com hour12: false, alguns ambientes retornam "24" à
     meia-noite em vez de "00"; normalizamos para 0 */
  const hora = buscar('hour') === 24 ? 0 : buscar('hour');

  return {
    ano: buscar('year'),
    mes: buscar('month'),
    dia: buscar('day'),
    hora,
    minuto: buscar('minute'),
    segundo: buscar('second'),
  };
}

/* FUNÇÃO AUXILIAR - CONVERTER UM "HH:mm" DO TURNO NO INSTANTE CORRETO
   EM BRASÍLIA, INDEPENDENTE DO FUSO DO SERVIDOR
   Ex.: horario "22:00" + referencia registrada às 01:00 de Brasília
        -> instante de 22:00 do MESMO dia de Brasília (-03:00)
   É a base do ancorarMomentoEstipulado, que depois decide se o turno
   pertence ao dia anterior ou seguinte (virada de noite). */
export function momentoBrasilia(horario: string, referencia: Date): Date {
  /* Aceita "HH:mm" ou só "HH" (minuto default = 0) */
  const [hora, minuto = 0] = horario.split(':').map(Number);

  /* Descobre que dia é "hoje" EM BRASÍLIA para a data de referência,
     mesmo que o servidor esteja em UTC ou em qualquer outro fuso */
  const partes = partesBrasilia(referencia);

  /* MONTA A STRING ISO COM O OFFSET FIXO DE BRASÍLIA (UTC-3)
     Seguro hoje: o Brasil não observa horário de verão desde 2019.
     padStart garante sempre 2 dígitos (mês "06", não "6") */
  const dataIso = `${partes.ano}-${String(partes.mes).padStart(2, '0')}-${String(partes.dia).padStart(2, '0')}T${String(hora).padStart(2, '0')}:${String(minuto).padStart(2, '0')}:00.000-03:00`;

  return new Date(dataIso);
}

/* HELPER - INÍCIO DO DIA CIVIL EM BRASÍLIA (LIMITE INFERIOR DE CONSULTA)
   Entrada: string "yyyy-mm-dd" vinda de um filtro de API
   Saída:   Date de 00:00:00.000 em -03:00 desse dia
   Se a entrada não for string no formato esperado, devolve o valor
   intacto (passthrough) para não quebrar filtros opcionais do Prisma */
export function inicioDoDiaBrasilia(valor: unknown): unknown {
  if (typeof valor !== 'string' || !FORMATO_DATA.test(valor)) return valor;
  return new Date(`${valor}T00:00:00.000-03:00`);
}

/* HELPER - FIM DO DIA CIVIL EM BRASÍLIA (LIMITE SUPERIOR DE CONSULTA)
   Espelho do inícioDoDiaBrasilia: Date de 23:59:59.999 em -03:00.
   Uso típico em consultas de banco:
   dataRegistro BETWEEN inicioDoDiaBrasilia(dia) AND fimDoDiaBrasilia(dia) */
export function fimDoDiaBrasilia(valor: unknown): unknown {
  if (typeof valor !== 'string' || !FORMATO_DATA.test(valor)) return valor;
  return new Date(`${valor}T23:59:59.999-03:00`);
}

/* HELPER - JANELA COMPLETA DO DIA CIVIL DE BRASÍLIA A PARTIR DE UM INSTANTE
   Entrada: qualquer Date (instante absoluto em UTC, ex.: new Date())
   Saída:   { inicio, fim } do dia civil de Brasília que contém esse
   instante: 00:00:00.000-03:00 até 23:59:59.999-03:00
   CORREÇÃO: substitui o padrão setHours(0,0,0,0), que zera horas no fuso
   do SERVIDOR e desloca a janela de busca em até 3h quando o servidor
   roda em UTC (meia-noite UTC = 21:00 do dia anterior em Brasília). */
export function janelaDiaBrasilia(data: Date): { inicio: Date; fim: Date } {
  const partes = partesBrasilia(data);

  const dia = `${partes.ano}-${String(partes.mes).padStart(2, '0')}-${String(partes.dia).padStart(2, '0')}`;

  return {
    inicio: new Date(`${dia}T00:00:00.000-03:00`),
    fim: new Date(`${dia}T23:59:59.999-03:00`),
  };
}

/* FORMATADOR - DATA E HORA DE BRASÍLIA PARA EXIBIÇÃO
   Entrada: Date (instante UTC, como gravado no banco)
   Saída:   string "dd/MM/yyyy HH:mm:ss" no fuso de Brasília
   Uso exclusivo na camada de resposta (DTO), nunca em cálculo de jornada */
export function formatarDataHoraBrasilia(data: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: FUSO_BRASILIA,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(data);
}

/* Formata de acordo com a estrutura de data que o back permite */
export function fomataDataLocal(data: Date): string {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}
