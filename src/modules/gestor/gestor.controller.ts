import { Controller, Get, Body, Patch, Param, Delete } from '@nestjs/common';
import { GestorService } from './gestor.service';
import { UpdateGestorDto } from './dto/update-gestor.dto';

@Controller('gestor')
export class GestorController {
  constructor(private readonly gestorService: GestorService) {}

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
