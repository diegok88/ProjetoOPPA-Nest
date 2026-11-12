import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { GeradorEscalaService } from './gerador-escala.service';
import { ResponseGeradorEscalaDto } from './dto/response-gerador-escala.dto';
import { Roles } from '@/auth/guards/roles.decorator';
import { ROLES } from '@/auth/guards/roles.const';
import { plainToInstance } from 'class-transformer';
import { HttpJwtGuard } from '@/auth/guards/http-jwt.guard';
import { HttpRolesGuard } from '@/auth/guards/http-roles.guard';

@Controller('gerador-escala')
@UseGuards(HttpJwtGuard, HttpRolesGuard)
export class GeradorEscalaController {
  constructor(private readonly geradorEscalaService: GeradorEscalaService) {}

  @Roles(ROLES.ASN1, ROLES.ADN1, ROLES.GER1, ROLES.SUP1)
  @Get('atual')
  async atual(): Promise<ResponseGeradorEscalaDto> {
    const escala = await this.geradorEscalaService.consultarEscala();
    return plainToInstance(ResponseGeradorEscalaDto, escala);
  }

  @Roles(ROLES.ASN1, ROLES.ADN1, ROLES.GER1, ROLES.SUP1)
  @Get()
  async porData(
    @Query('data') data?: string,
  ): Promise<ResponseGeradorEscalaDto> {
    const escala = await this.geradorEscalaService.consultarEscala(data);
    return plainToInstance(ResponseGeradorEscalaDto, escala);
  }
}
