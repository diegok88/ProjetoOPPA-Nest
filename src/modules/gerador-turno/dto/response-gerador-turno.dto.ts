import { Expose } from 'class-transformer';
import type { TurnoVigente } from '@/utils/turno.util';

export class ResponseTurnoDto {
  @Expose() turno!: TurnoVigente;
  @Expose() inicio!: string; // ex.: "14:00"
  @Expose() fim!: string; // ex.: "22:00"
  @Expose() timezone!: string; // ex.: "America/Sao_Paulo"
  @Expose() consultadoEm!: string; // ISO 8601 (UTC)
}
