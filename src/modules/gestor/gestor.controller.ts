import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { GestorService } from './gestor.service';
import { QueryGestorFilterDto } from './dto/query-gestor.dto';
import {
  ResponseGestorDto,
  ResponseGestorRelacoesDto,
  ResponseGestorRelacoesParcialDto,
  ResponseGestorUsuarioDto,
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
  ): Promise<ResponseGestorRelacoesDto[]> {
    const dados = await this.gestorService.findAllGestor(query);
    return plainToInstance(ResponseGestorRelacoesDto, dados);
  }

  @Get('list')
  @Roles(ROLES.ASN1)
  async findAllGestorParcial(
    @Query() query: QueryGestorFilterDto,
  ): Promise<ResponseGestorRelacoesParcialDto[]> {
    const dados = await this.gestorService.findAllGestorParcial(query);
    return plainToInstance(ResponseGestorRelacoesParcialDto, dados);
  }

  @Get(':id')
  @Roles(ROLES.ASN1)
  async findOne(@Param('id') id: string): Promise<ResponseGestorDto> {
    const dado = this.gestorService.findOne(id);
    return plainToInstance(ResponseGestorDto, dado);
  }

  @Get('findOneUser/:id')
  @Roles(ROLES.ASN1)
  async findOneUser(
    @Param('id') id: string,
  ): Promise<ResponseGestorUsuarioDto> {
    const dado = this.gestorService.findOneUser(id);
    return plainToInstance(ResponseGestorUsuarioDto, dado);
  }
}
