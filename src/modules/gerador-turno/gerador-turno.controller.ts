import { Controller, Get } from '@nestjs/common';
import { ResponseTurnoDto } from './dto/response-gerador-turno.dto';
import { GeradorTurnoService } from './gerador-turno.service';
import { plainToInstance } from 'class-transformer';

@Controller('gerador-turno')
export class GeradorTurnoController {
  constructor(private readonly turnoService: GeradorTurnoService) {}

  @Get('atual')
  async getAtual(): Promise<ResponseTurnoDto> {
    const turnoAtual = await this.turnoService.getTurnoAtual();
    return plainToInstance(ResponseTurnoDto, turnoAtual);
  }
}
