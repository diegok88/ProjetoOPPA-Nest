import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { GestorService } from './gestor.service';
import { QueryGestorFilterDto } from './dto/query-gestor.dto';
import {
  ResponseGestorColaboradorDto,
  ResponseGestorDto,
} from './dto/response-gestor.dto';
import { plainToInstance } from 'class-transformer';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/auth/guards/roles-auth.guard';
import { ROLES } from '@/auth/guards/roles.const';
import { Roles } from '@/auth/guards/roles.decorator';

@Controller('gestor')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GestorController {
  constructor(private readonly gestorService: GestorService) {}

  @Get()
  @Roles(ROLES.ASN1)
  async findAll(
    @Query() query: QueryGestorFilterDto,
  ): Promise<ResponseGestorDto[]> {
    const dados = await this.gestorService.findAll(query);
    return plainToInstance(ResponseGestorDto, dados);
  }

  @Get('gestor_colaborador')
  @Roles(ROLES.ASN1)
  async findAllGestor(
    @Query() query: QueryGestorFilterDto,
  ): Promise<ResponseGestorColaboradorDto[]> {
    const dados = await this.gestorService.findAllGestor(query);
    return plainToInstance(ResponseGestorColaboradorDto, dados);
  }

  @Get(':id')
  @Roles(ROLES.ASN1)
  async findOne(@Param('id') id: string): Promise<ResponseGestorDto> {
    const dado = this.gestorService.findOne(id);
    return plainToInstance(ResponseGestorDto, dado);
  }
}
