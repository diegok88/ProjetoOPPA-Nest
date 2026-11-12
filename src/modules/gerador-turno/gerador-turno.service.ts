import {
  FUSO_REFERENCIA,
  obterFaixaTurno,
  obterTurnoVigente,
} from '@/utils/turno.util';
import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { ResponseTurnoDto } from './dto/response-gerador-turno.dto';

@Injectable()
export class GeradorTurnoService {
  async getTurnoAtual(): Promise<ResponseTurnoDto> {
    const agora = new Date();
    const turno = obterTurnoVigente(agora);
    const faixa = obterFaixaTurno(turno);

    return plainToInstance(ResponseTurnoDto, {
      turno,
      inicio: formatarHora(faixa.inicio),
      fim: formatarHora(faixa.fim),
      timezone: FUSO_REFERENCIA,
      consultadoEm: agora.toISOString(),
    });
  }
}

function formatarHora(hora: number): string {
  return `${String(hora).padStart(2, '0')}:00`;
}
