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
import {
  UpdateEmpresaDeactiveDto,
  UpdateEmpresaDto,
} from './dto/update-empresa.dto';
import { EmpresaService } from './empresa.service';

@Controller('empresa')
export class EmpresaController {
  constructor(private readonly empresaService: EmpresaService) {}

  // CONTROLLER CRIAR EMPRESA
  @Post()
  async create(
    @Body() createEmpresaDto: CreateEmpresaDto,
  ): Promise<ResponseEmpresaDto> {
    return this.empresaService.createEnterprise(createEmpresaDto);
  }

  // CONTROLLER LISTAR EMPRESAS
  @Get()
  async findAll(): Promise<ResponseEmpresaDto[]> {
    return this.empresaService.findAllEnterprise();
  }

  // CONTROLLER BUSCAR EMPRESA PELO ID
  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseEmpresaDto> {
    return this.empresaService.findOneEnterprise(id);
  }

  // CONTROLLER ATUALIZAR EMPRESA PELO ID
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateEmpresaDto: UpdateEmpresaDto,
  ): Promise<ResponseEmpresaDto> {
    return this.empresaService.updateEnterprise(id, updateEmpresaDto);
  }

  // CONTROLLER INATIVAR EMPRESA PELO ID
  @Patch('deactive/:id')
  async deactive(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateEmpresaDeactiveDto: UpdateEmpresaDeactiveDto,
  ): Promise<ResponseEmpresaDto> {
    return this.empresaService.deactiveEnterprise(id, updateEmpresaDeactiveDto);
  }

  // CONTROLLER DELETAR EMPRESA PELO ID
  @Delete(':id')
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseEmpresaDto> {
    return this.empresaService.removeEnterprise(id);
  }
}
