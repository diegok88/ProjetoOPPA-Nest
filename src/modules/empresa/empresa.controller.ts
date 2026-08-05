import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/auth/guards/roles-auth.guard';
import { ROLES } from '@/auth/guards/roles.const';
import { Roles } from '@/auth/guards/roles.decorator';
import { TYPES_NOTICES } from '@/utils/types-notices.cosnt';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { QueryEmpresaFilterDto } from './dto/query-empresa.dto';
import {
  ResponseEmpresaDto,
  ResponseEmpresaMessageDto,
} from './dto/response-empresa.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';
import { EmpresaService } from './empresa.service';

@Controller('empresa')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EmpresaController {
  constructor(private readonly empresaService: EmpresaService) {}

  // CONTROLLER CRIAR EMPRESA
  @Post()
  @Roles(ROLES.ASN1)
  async create(
    @Body() createEmpresaDto: CreateEmpresaDto,
  ): Promise<ResponseEmpresaMessageDto> {
    await this.empresaService.create(createEmpresaDto);
    return plainToClass(ResponseEmpresaMessageDto, TYPES_NOTICES.CREATE);
  }

  // CONTROLLER LISTAR EMPRESAS
  @Get()
  @Roles(ROLES.ASN1)
  async findAll(
    @Query() query: QueryEmpresaFilterDto,
  ): Promise<ResponseEmpresaDto[]> {
    const dados = await this.empresaService.findAll(query);
    return dados.map((lista) => plainToClass(ResponseEmpresaDto, lista));
  }

  // CONTROLLER BUSCAR EMPRESA PELO ID
  @Get(':id')
  @Roles(ROLES.ASN1)
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseEmpresaDto> {
    const dado = await this.empresaService.findOne(id);
    return plainToClass(ResponseEmpresaDto, dado);
  }

  // CONTROLLER ATUALIZAR EMPRESA PELO ID
  @Patch(':id')
  @Roles(ROLES.ASN1)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateEmpresaDto: UpdateEmpresaDto,
  ): Promise<ResponseEmpresaDto> {
    const dado = await this.empresaService.update(id, updateEmpresaDto);
    return plainToClass(ResponseEmpresaDto, dado);
  }

  // CONTROLLER INATIVAR EMPRESA PELO ID
  @Patch('deactive/:id')
  @Roles(ROLES.ASN1, ROLES.ADN1)
  async deactive(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseEmpresaDto> {
    const dado = await this.empresaService.deactive(id);
    return plainToClass(ResponseEmpresaDto, dado);
  }

  // CONTROLLER DELETAR EMPRESA PELO ID
  @Delete(':id')
  @Roles(ROLES.ASN1)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseEmpresaDto> {
    const dado = await this.empresaService.remove(id);
    return plainToClass(ResponseEmpresaDto, dado);
  }
}
