import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CreatePerfilDto } from './dto/create-perfil.dto';
import { ResponsePerfilDto } from './dto/response-perfil.dto';
import { UpdatePerfilDto } from './dto/update-perfil.dto';
import { PerfilService } from './perfil.service';

@Controller('perfil')
export class PerfilController {
  constructor(private readonly perfilService: PerfilService) {}

  @Post()
  async create(
    @Body() createPerfilDto: CreatePerfilDto,
  ): Promise<ResponsePerfilDto> {
    return this.perfilService.create(createPerfilDto);
  }

  @Get()
  findAll() {
    return this.perfilService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.perfilService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePerfilDto: UpdatePerfilDto) {
    return this.perfilService.update(+id, updatePerfilDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.perfilService.remove(+id);
  }
}
