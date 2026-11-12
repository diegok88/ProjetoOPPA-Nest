import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EficienciaOperacionalService } from './eficiencia-operacional.service';
import { CreateEficienciaOperacionalDto } from './dto/create-eficiencia-operacional.dto';
import { UpdateEficienciaOperacionalDto } from './dto/update-eficiencia-operacional.dto';

@Controller('eficiencia-operacional')
export class EficienciaOperacionalController {
  constructor(private readonly eficienciaOperacionalService: EficienciaOperacionalService) {}

  @Post()
  create(@Body() createEficienciaOperacionalDto: CreateEficienciaOperacionalDto) {
    return this.eficienciaOperacionalService.create(createEficienciaOperacionalDto);
  }

  @Get()
  findAll() {
    return this.eficienciaOperacionalService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eficienciaOperacionalService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEficienciaOperacionalDto: UpdateEficienciaOperacionalDto) {
    return this.eficienciaOperacionalService.update(+id, updateEficienciaOperacionalDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.eficienciaOperacionalService.remove(+id);
  }
}
