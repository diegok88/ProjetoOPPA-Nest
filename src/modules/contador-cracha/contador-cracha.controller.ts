import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ContadorCrachaService } from './contador-cracha.service';
import { CreateContadorCrachaDto } from './dto/create-contador-cracha.dto';
import { UpdateContadorCrachaDto } from './dto/update-contador-cracha.dto';

@Controller('contador-cracha')
export class ContadorCrachaController {
  constructor(private readonly contadorCrachaService: ContadorCrachaService) {}

  @Post()
  create(@Body() createContadorCrachaDto: CreateContadorCrachaDto) {
    return this.contadorCrachaService.create(createContadorCrachaDto);
  }

  @Get()
  findAll() {
    return this.contadorCrachaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.contadorCrachaService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateContadorCrachaDto: UpdateContadorCrachaDto) {
    return this.contadorCrachaService.update(+id, updateContadorCrachaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.contadorCrachaService.remove(+id);
  }
}
