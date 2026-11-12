import { BadRequestException, Injectable } from '@nestjs/common';
import { TipoEscala } from '@/generated/prisma/enums';
import { ResultadoEscala } from './entities/gerador-escala.entity';

const MS_POR_DIA = 24 * 60 * 60 * 1000;
const TAMANHO_CICLO = 8;
const FUSO_PADRAO = 'America/Sao_Paulo';

const CICLO_ESCALAS: readonly TipoEscala[] = [
  TipoEscala.A,
  TipoEscala.A,
  TipoEscala.B,
  TipoEscala.B,
  TipoEscala.C,
  TipoEscala.C,
  TipoEscala.D,
  TipoEscala.D,
];

@Injectable()
export class GeradorEscalaService {
  private readonly dataReferencia: Date;

  constructor() {
    const referenciaEnv = process.env.ESCALA_DATA_INICIAL ?? '2026-01-01';
    const data = this.parseIsoUTC(referenciaEnv);
    if (!data) {
      throw new Error(
        `ESCALA_DATA_INICIAL inválida: "${referenciaEnv}". Use o formato YYYY-MM-DD.`,
      );
    }
    this.dataReferencia = data;
  }

  async consultarEscala(dataIso?: string): Promise<ResultadoEscala> {
    let data: Date;

    if (dataIso === undefined) {
      data = this.hojeNoFuso(FUSO_PADRAO);
    } else {
      const parsed = this.parseIsoUTC(dataIso);
      if (!parsed) {
        throw new BadRequestException(
          'Parâmetro "data" deve estar no formato YYYY-MM-DD.',
        );
      }
      data = parsed;
    }

    const dias = Math.round(
      (data.getTime() - this.dataReferencia.getTime()) / MS_POR_DIA,
    );
    const indice = ((dias % TAMANHO_CICLO) + TAMANHO_CICLO) % TAMANHO_CICLO;

    return {
      data: this.formatarIso(data),
      escala: CICLO_ESCALAS[indice],
      posicaoNoCiclo: indice + 1,
      dataReferencia: this.formatarIso(this.dataReferencia),
    };
  }

  private hojeNoFuso(fuso: string): Date {
    const hoje = new Intl.DateTimeFormat('en-CA', {
      timeZone: fuso,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());

    return this.parseIsoUTC(hoje)!;
  }

  private parseIsoUTC(valor: string): Date | null {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(valor);
    if (!match) return null;

    const [, ano, mes, dia] = match.map(Number);
    const data = new Date(Date.UTC(ano, mes - 1, dia));

    if (
      data.getUTCFullYear() !== ano ||
      data.getUTCMonth() !== mes - 1 ||
      data.getUTCDate() !== dia
    ) {
      return null;
    }
    return data;
  }

  private formatarIso(data: Date): string {
    return data.toISOString().slice(0, 10);
  }
}
