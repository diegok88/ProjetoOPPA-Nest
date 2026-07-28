import type { AuthenticatedRequest } from '@/auth/express/authenticated-request.interface';
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
  Req,
  UseGuards,
} from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { DeleteEmpresaDto } from './dto/delete-empresa';
import { QueryEmpresaFilterDto } from './dto/query-empresa.dto';
import {
  ResponseEmpresaDto,
  ResponseEmpresaMessageDto,
} from './dto/response-empresa.dto';
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.ASN1)
  async create(
    @Body() createEmpresaDto: CreateEmpresaDto,
  ): Promise<ResponseEmpresaMessageDto> {
    await this.empresaService.create(createEmpresaDto);
    return plainToClass(ResponseEmpresaMessageDto, TYPES_NOTICES.CREATE);
  }

  // CONTROLLER LISTAR EMPRESAS
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.ASN1)
  async findAll(
    @Query() query: QueryEmpresaFilterDto,
  ): Promise<ResponseEmpresaDto[]> {
    const dados = await this.empresaService.findAll(query);
    return dados.map((lista) => plainToClass(ResponseEmpresaDto, lista));
  }

  // CONTROLLER BUSCAR EMPRESA PELO ID
  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseEmpresaDto> {
    const dado = this.empresaService.findOne(id);
    return plainToClass(ResponseEmpresaDto, dado);
  }

  // CONTROLLER ATUALIZAR EMPRESA PELO ID - Implementar o id da empresa no token
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateEmpresaDto: UpdateEmpresaDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<ResponseEmpresaDto> {
    const usuario = req.user.userId;
    return this.empresaService.update(id, usuario, updateEmpresaDto);
  }

  // CONTROLLER INATIVAR EMPRESA PELO ID
  @Patch('deactive/:id')
  async deactive(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateEmpresaDeactiveDto: UpdateEmpresaDeactiveDto,
  ): Promise<ResponseEmpresaDto> {
    return this.empresaService.deactive(id, updateEmpresaDeactiveDto);
  }

  // CONTROLLER DELETAR EMPRESA PELO ID
  @Delete(':id')
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() deleteEmpresaDto: DeleteEmpresaDto,
  ): Promise<ResponseEmpresaDto> {
    return this.empresaService.remove(id, deleteEmpresaDto);
  }
}
