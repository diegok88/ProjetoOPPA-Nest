import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
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
  // CRIAR PERFIL
  @Post()
  async create(
    @Body() createPerfilDto: CreatePerfilDto,
  ): Promise<ResponsePerfilDto> {
    return this.perfilService.create(createPerfilDto);
  }
  // LISTAR PERFIS
  @Get()
  async findAll(): Promise<ResponsePerfilDto[]> {
    return this.perfilService.findAll();
  }
  // BUSCAR PERFIL PELO ID
  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponsePerfilDto> {
    return this.perfilService.findOne(id);
  }
  // ATUALIZAÇÃO DO PERFIL PELO ID
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePerfilDto: UpdatePerfilDto,
  ): Promise<ResponsePerfilDto> {
    return this.perfilService.update(id, updatePerfilDto);
  }
  // INATIVAÇÃO DO PERFIL PELO ID
  @Patch('deactive/:id')
  async deactive(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponsePerfilDto> {
    return this.perfilService.deactive(id);
  }
  // DELETE DO PERFIL PELO ID
  @Delete(':id')
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponsePerfilDto> {
    return this.perfilService.remove(id);
  }
}
