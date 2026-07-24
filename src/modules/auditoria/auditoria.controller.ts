import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { AuditoriaService } from './auditoria.service';
import { CreateAuditoriaDto } from './dto/create-auditoria.dto';
import { ResponseAuditoriaDto } from './dto/response-auditoria.dto';
import { UpdateAuditoriaDto } from './dto/update-auditoria.dto';
import { QueryAuditoriaRegisteredByIdDto } from './dto/query-auditoria.dto';

@Controller('auditoria')
export class AuditoriaController {
  constructor(private readonly auditoriaService: AuditoriaService) {}

  @Post()
  async create(
    @Body() createAuditoriaDto: CreateAuditoriaDto,
  ): Promise<ResponseAuditoriaDto> {
    return this.auditoriaService.create(createAuditoriaDto);
  }

  @Post()
  async update(
    @Body() updateAuditoriaDto: UpdateAuditoriaDto,
  ): Promise<ResponseAuditoriaDto> {
    return this.auditoriaService.update(updateAuditoriaDto);
  }

  @Get()
  async findAll(): Promise<ResponseAuditoriaDto[]> {
    return this.auditoriaService.findAll();
  }

  async findRegisteredById(
    @Query() query: QueryAuditoriaRegisteredByIdDto,
  ): Promise<ResponseAuditoriaDto[]> {
    return this.auditoriaService.findRegisteredById(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ResponseAuditoriaDto> {
    return this.auditoriaService.findOne(id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<ResponseAuditoriaDto> {
    return this.auditoriaService.remove(id);
  }
}
