import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CompetenciaSetorialService } from './competencia-setorial.service';
import { CreateCompetenciaSetorialDto } from './dto/create-competencia-setorial.dto';
import { UpdateCompetenciaSetorialDto } from './dto/update-competencia-setorial.dto';

@Controller('competencia-setorial')
export class CompetenciaSetorialController {
  constructor(private readonly competenciaSetorialService: CompetenciaSetorialService) {}

  @Post()
  create(@Body() createCompetenciaSetorialDto: CreateCompetenciaSetorialDto) {
    return this.competenciaSetorialService.create(createCompetenciaSetorialDto);
  }

  @Get()
  findAll() {
    return this.competenciaSetorialService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.competenciaSetorialService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCompetenciaSetorialDto: UpdateCompetenciaSetorialDto) {
    return this.competenciaSetorialService.update(+id, updateCompetenciaSetorialDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.competenciaSetorialService.remove(+id);
  }
}
