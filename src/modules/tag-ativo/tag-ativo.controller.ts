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
import { TagAtivoService } from './tag-ativo.service';
import { CreateTagAtivoDto } from './dto/create-tag-ativo.dto';
import { UpdateTagAtivoDto } from './dto/update-tag-ativo.dto';

import {
  ResponseTagAtivoContadorDto,
  ResponseTagAtivoDto,
  ResponseTagAtivoPaginadaDto,
  ResponseTagAtivoRelacaoDto,
} from './dto/response-tag-ativo.dto';
import { plainToInstance } from 'class-transformer';
import { ROLES } from '@/auth/guards/roles.const';
import { Roles } from '@/auth/guards/roles.decorator';
import {
  QueryTagAtivoFilterDto,
  QueryTagAtivoSetoresDto,
} from './dto/query-tag-ativo.dto';
import { HttpJwtGuard } from '@/auth/guards/http-jwt.guard';
import { HttpRolesGuard } from '@/auth/guards/http-roles.guard';

@Controller('tag-ativo')
@UseGuards(HttpJwtGuard, HttpRolesGuard)
export class TagAtivoController {
  constructor(private readonly tagAtivoService: TagAtivoService) {}

  @Post()
  @Roles(ROLES.ASN1, ROLES.ADN1)
  async create(
    @Body() createTagAtivoDto: CreateTagAtivoDto,
  ): Promise<ResponseTagAtivoDto> {
    const dado = await this.tagAtivoService.create(createTagAtivoDto);
    return plainToInstance(ResponseTagAtivoDto, dado);
  }

  @Get()
  @Roles(ROLES.ASN1, ROLES.ADN1)
  async findAll(
    @Query() query: QueryTagAtivoFilterDto,
  ): Promise<ResponseTagAtivoRelacaoDto[] | ResponseTagAtivoPaginadaDto> {
    const dados = await this.tagAtivoService.findAll(query);
    return query.decisao === 'listar'
      ? plainToInstance(ResponseTagAtivoRelacaoDto, dados.dados)
      : plainToInstance(ResponseTagAtivoPaginadaDto, dados);
  }

  @Get('setor')
  @Roles(ROLES.ASN1, ROLES.SUP1)
  async findAllSection(
    @Query() query: QueryTagAtivoSetoresDto,
  ): Promise<ResponseTagAtivoRelacaoDto[]> {
    const dados = await this.tagAtivoService.findAllSection(query);
    return plainToInstance(ResponseTagAtivoRelacaoDto, dados);
  }

  @Get('counter')
  @Roles(ROLES.ASN1, ROLES.ADN1)
  async counter(): Promise<ResponseTagAtivoContadorDto> {
    const contador = await this.tagAtivoService.counter();
    return plainToInstance(ResponseTagAtivoContadorDto, contador);
  }

  @Get(':id')
  @Roles(ROLES.ASN1, ROLES.ADN1)
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseTagAtivoRelacaoDto> {
    const dado = await this.tagAtivoService.findOne(id);
    return plainToInstance(ResponseTagAtivoRelacaoDto, dado);
  }

  @Patch(':id')
  @Roles(ROLES.ASN1)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTagAtivoDto: UpdateTagAtivoDto,
  ): Promise<ResponseTagAtivoDto> {
    const dado = await this.tagAtivoService.update(id, updateTagAtivoDto);
    return plainToInstance(ResponseTagAtivoDto, dado);
  }

  @Patch('active/:id')
  @Roles(ROLES.ASN1)
  async active(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseTagAtivoDto> {
    const dado = await this.tagAtivoService.active(id);
    return plainToInstance(ResponseTagAtivoDto, dado);
  }

  @Patch('deactive/:id')
  @Roles(ROLES.ASN1)
  async deactive(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseTagAtivoDto> {
    const dado = await this.tagAtivoService.deactive(id);
    return plainToInstance(ResponseTagAtivoDto, dado);
  }

  @Delete(':id')
  @Roles(ROLES.ASN1)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseTagAtivoDto> {
    const dado = await this.tagAtivoService.remove(id);
    return plainToInstance(ResponseTagAtivoDto, dado);
  }
}
