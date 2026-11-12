import { TipoJornada, TipoEstadoJornada } from '@/generated/prisma/enums';
import { momentoBrasilia } from './data-brasilia.util';
import { ResponseTurnoDto } from '@/modules/gerador-turno/dto/response-gerador-turno.dto';

const TOLERANCIA_MINUTOS = 15;
const DURACAO_INTERVALO_MINUTOS = 60;

/* LIMITE DE MEIA JORNADA - usado para detectar virada de dia no turno noturno */
const LIMITE_MEIA_JORNADA_MS = 12 * 60 * 60 * 1000;

/* FUNÇÃO AUXILIAR - ANCORA O HORÁRIO ESTIPULADO NO DIA CORRETO DO TURNO */
function ancorarMomentoEstipulado(
  horario: string,
  dataRegistro: Date,
  tipo: 'entrada' | 'saida',
): Date {
  const momento = momentoBrasilia(horario, dataRegistro);

  /* ENTRADA: se o horário estipulado ficou mais de 12h NO FUTURO,
     o turno começou no dia ANTERIOR (turno noturno, registro após 00:00) */
  if (
    tipo === 'entrada' &&
    momento.getTime() - dataRegistro.getTime() > LIMITE_MEIA_JORNADA_MS
  ) {
    momento.setDate(momento.getDate() - 1);
  }

  /* SAÍDA: se o horário estipulado ficou mais de 12h NO PASSADO,
     a saída pertence ao expediente que termina no dia SEGUINTE
     (turno noturno, registro antes de 00:00) */
  if (
    tipo === 'saida' &&
    dataRegistro.getTime() - momento.getTime() > LIMITE_MEIA_JORNADA_MS
  ) {
    momento.setDate(momento.getDate() + 1);
  }

  return momento;
}

/* FUNÇÃO DE AVALIAÇÃO - RETORNA O ESTADO DA JORNADA (CONFORME/ATRASO/ANTECIPADO)
   Substitui o boolean da versão anterior: um boolean não distingue a
   DIREÇÃO do desvio, e o retorno antecipado exige saber se o registro
   veio ANTES do prazo. É aqui que nasce a regra "intervalo menor que 1h
   -> ANTECIPADO". */
export function avaliarEstadoJornada(
  tipoJornada: TipoJornada,
  dataRegistro: Date,
  turno: ResponseTurnoDto,
  registroEntradaIntervalo?: Date,
): TipoEstadoJornada {
  const toleranciaMs = TOLERANCIA_MINUTOS * 60 * 1000;

  switch (tipoJornada) {
    case TipoJornada.ENTRADA_EXPEDIENTE: {
      if (!turno.inicio) return TipoEstadoJornada.CONFORME;

      const momentoEstipulado = ancorarMomentoEstipulado(
        turno.inicio,
        dataRegistro,
        'entrada',
      );

      /* Entrada depois do estipulado + 15min -> ATRASO.
         Entrada adiantada permanece CONFORME (regra clássica de ponto) */
      return dataRegistro.getTime() > momentoEstipulado.getTime() + toleranciaMs
        ? TipoEstadoJornada.ATRASO
        : TipoEstadoJornada.CONFORME;
    }

    case TipoJornada.SAIDA_INTERVALO:
      /* Saída para intervalo não tem prazo estipulado: sempre conforme */
      return TipoEstadoJornada.CONFORME;

    case TipoJornada.RETORNO_INTERVALO: {
      if (!registroEntradaIntervalo) return TipoEstadoJornada.CONFORME;

      /* Retorno estipulado = entrada no intervalo + 1h de duração */
      const retornoEstipulado = new Date(registroEntradaIntervalo);
      retornoEstipulado.setMinutes(
        retornoEstipulado.getMinutes() + DURACAO_INTERVALO_MINUTOS,
      );

      /* INTERVALO MENOR QUE 1H -> RETORNO ANTECIPADO
     Único desvio gravado neste fluxo: a infração é interromper o
     intervalo antes da hora mínima */
      if (dataRegistro.getTime() < retornoEstipulado.getTime()) {
        return TipoEstadoJornada.ANTECIPADO;
      }

      /* Intervalo cumprido (1h ou mais) -> CONFORME
     O retorno atrasado NÃO grava ATRASO aqui: a regra de negócio define
     que apenas a antecipação altera o estado neste caso. Se um dia o
     atraso voltar a ser exigido, re-incluir antes do return:
       if (dataRegistro.getTime() > retornoEstipulado.getTime() + toleranciaMs)
         return TipoEstadoJornada.ATRASO; */
      return TipoEstadoJornada.CONFORME;
    }

    case TipoJornada.SAIDA_EXPEDIENTE: {
      if (!turno.fim) return TipoEstadoJornada.CONFORME;

      const momentoEstipulado = ancorarMomentoEstipulado(
        turno.fim,
        dataRegistro,
        'saida',
      );

      /* SAÍDA MAIS DE 15MIN ANTES DO FIM -> SAÍDA ANTECIPADA
         O estado sai daqui, o service não precisa mais mapear
         "SAIDA_EXPEDIENTE -> ANTECIPADO" manualmente */
      if (dataRegistro.getTime() < momentoEstipulado.getTime() - toleranciaMs) {
        return TipoEstadoJornada.ANTECIPADO;
      }

      return TipoEstadoJornada.CONFORME;
    }

    default:
      return TipoEstadoJornada.CONFORME;
  }
}

/* FUNÇÃO DE COMPARAÇÃO - COMPATIBILIDADE COM O CONTRATO BOOLEANO ANTIGO
   true = houve desvio em qualquer direção (atraso OU antecipação).
   Mantida para não quebrar quem já a chamava; o CREATE do service
   passa a usar avaliarEstadoJornada. */
export function verificarTolerancia(
  tipoJornada: TipoJornada,
  dataRegistro: Date,
  turno: ResponseTurnoDto,
  registroEntradaIntervalo?: Date,
): boolean {
  return (
    avaliarEstadoJornada(
      tipoJornada,
      dataRegistro,
      turno,
      registroEntradaIntervalo,
    ) !== TipoEstadoJornada.CONFORME
  );
}
