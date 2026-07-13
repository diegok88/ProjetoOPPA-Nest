import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { GestorService } from './gestor.service';
import { CreateGestorDto } from './dto/create-gestor.dto';
import { UpdateGestorDto } from './dto/update-gestor.dto';

@Controller('gestor')
export class GestorController {
  constructor(private readonly gestorService: GestorService) {}

  @Post()
  create(@Body() createGestorDto: CreateGestorDto) {
    return this.gestorService.create(createGestorDto);
  }

  @Get()
  findAll() {
    return this.gestorService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.gestorService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGestorDto: UpdateGestorDto) {
    return this.gestorService.update(+id, updateGestorDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.gestorService.remove(+id);
  }
}
