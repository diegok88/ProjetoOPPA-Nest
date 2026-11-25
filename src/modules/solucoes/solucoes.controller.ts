import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { SolucoesService } from './solucoes.service';
import { CreateSolucoesDto } from './dto/create-solucoes.dto';
import { UpdateSolucoeDto } from './dto/update-solucoes.dto';
import {
  ResponseSolucoesContadorDto,
  ResponseSolucoesDto,
  ResponseSolucoesPaginadaDto,
  ResponseSolucoesRelacaoDto,
} from './dto/response-solucoes.dto';
import { plainToInstance } from 'class-transformer';
import { ROLES } from '@/auth/guards/roles.const';
import { Roles } from '@/auth/guards/roles.decorator';
import {
  QuerySolucaoFilterDto,
  QuerySolucoesFilterDto,
} from './dto/query-solucoes.dto';
import { HttpJwtGuard } from '@/auth/guards/http-jwt.guard';
import { HttpRolesGuard } from '@/auth/guards/http-roles.guard';

@Controller('solucoes')
@UseGuards(HttpJwtGuard, HttpRolesGuard)
export class SolucoesController {
  constructor(private readonly solucoesService: SolucoesService) {}

  @Post()
  @Roles(ROLES.ASN1, ROLES.ADN1)
  async create(
    @Body() createSolucoesDto: CreateSolucoesDto,
  ): Promise<ResponseSolucoesDto> {
    const dado = await this.solucoesService.create(createSolucoesDto);
    return plainToInstance(ResponseSolucoesDto, dado);
  }

  @Get()
  @Roles(ROLES.ASN1, ROLES.ADN1)
  async findAll(
    @Query() query: QuerySolucoesFilterDto,
  ): Promise<ResponseSolucoesRelacaoDto[]> {
    const dados = await this.solucoesService.findAll(query);
    return plainToInstance(ResponseSolucoesRelacaoDto, dados);
  }

  @Get('counter')
  @Roles(ROLES.ASN1, ROLES.ADN1)
  async counter(): Promise<ResponseSolucoesContadorDto> {
    const contador = await this.solucoesService.counter();
    return plainToInstance(ResponseSolucoesContadorDto, contador);
  }

  @Get()
  @Roles(ROLES.ASN1, ROLES.TER1)
  async findAllPagination(
    @Query() query: QuerySolucaoFilterDto,
  ): Promise<ResponseSolucoesPaginadaDto> {
    const resultado = await this.solucoesService.findAllPagination(query);
    return plainToInstance(ResponseSolucoesPaginadaDto, resultado);
  }

  @Get('listar')
  @Roles(ROLES.ASN1, ROLES.TER1)
  async findAllList(
    @Query() query: QuerySolucaoFilterDto,
  ): Promise<ResponseSolucoesRelacaoDto[]> {
    const resultado = await this.solucoesService.findAllList(query);
    return plainToInstance(ResponseSolucoesRelacaoDto, resultado);
  }

  @Get(':id')
  @Roles(ROLES.ASN1, ROLES.ADN1)
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseSolucoesRelacaoDto> {
    const dado = await this.solucoesService.findOne(id);
    return plainToInstance(ResponseSolucoesRelacaoDto, dado);
  }

  @Get('unico')
  @Roles(ROLES.ASN1, ROLES.TER1)
  async findOneFirst(
    @Query() query: QuerySolucaoFilterDto,
  ): Promise<ResponseSolucoesDto> {
    const registro = await this.solucoesService.findOneFirst(query);
    return plainToInstance(ResponseSolucoesDto, registro);
  }

  @Patch(':id')
  @Roles(ROLES.ASN1, ROLES.ADN1)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSolucoeDto: UpdateSolucoeDto,
  ): Promise<ResponseSolucoesDto> {
    const dado = await this.solucoesService.update(id, updateSolucoeDto);
    return plainToInstance(ResponseSolucoesDto, dado);
  }

  @Patch('active/:id')
  @Roles(ROLES.ASN1, ROLES.ADN1)
  async active(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseSolucoesDto> {
    const dado = await this.solucoesService.active(id);
    return plainToInstance(ResponseSolucoesDto, dado);
  }

  @Patch('deactive/:id')
  @Roles(ROLES.ASN1, ROLES.ADN1)
  async deactive(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseSolucoesDto> {
    const dado = await this.solucoesService.deactive(id);
    return plainToInstance(ResponseSolucoesDto, dado);
  }

  @Delete(':id')
  @Roles(ROLES.ASN1)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseSolucoesDto> {
    const dado = await this.solucoesService.remove(id);
    return plainToInstance(ResponseSolucoesDto, dado);
  }
}
