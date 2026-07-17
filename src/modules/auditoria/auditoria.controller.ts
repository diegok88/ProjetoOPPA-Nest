import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { AuditoriaService } from './auditoria.service';
import { CreateAuditoriaDto } from './dto/create-auditoria.dto';
import { ResponseAuditoriaDto } from './dto/response-auditoria.dto';
import { UpdateAuditoriaDto } from './dto/update-auditoria.dto';

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

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.auditoriaService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.auditoriaService.remove(+id);
  }
}
