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
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { ResponseEmpresaDto } from './dto/response-empresa.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';
import { EmpresaService } from './empresa.service';

@Controller('empresa')
export class EmpresaController {
  constructor(private readonly empresaService: EmpresaService) {}

  // CONTROLLER CRIAR EMPRESA
  @Post()
  async create(
    @Body() createEmpresaDto: CreateEmpresaDto,
  ): Promise<ResponseEmpresaDto> {
    return this.empresaService.create(createEmpresaDto);
  }

  // CONTROLLER LISTAR EMPRESAS
  @Get()
  async findAll(): Promise<ResponseEmpresaDto[]> {
    return this.empresaService.findAll();
  }

  // CONTROLLER BUSCAR EMPRESA PELO ID
  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseEmpresaDto> {
    return this.empresaService.findOne(id);
  }

  // CONTROLLER ATUALIZAR EMPRESA PELO ID
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateEmpresaDto: UpdateEmpresaDto,
  ): Promise<ResponseEmpresaDto> {
    return this.empresaService.update(id, updateEmpresaDto);
  }

  // CONTROLLER INATIVAR EMPRESA PELO ID
  @Patch('deactive/:id')
  async deactive(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseEmpresaDto> {
    return this.empresaService.deactive(id);
  }

  // CONTROLLER DELETAR EMPRESA PELO ID
  @Delete(':id')
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseEmpresaDto> {
    return this.empresaService.remove(id);
  }
}
