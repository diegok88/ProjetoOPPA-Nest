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
import { plainToClass, plainToInstance } from 'class-transformer';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { QueryEmpresaFilterDto } from './dto/query-empresa.dto';
import {
  ResponseEmpresaContadorDto,
  ResponseEmpresaDto,
  ResponseEmpresaListDto,
  ResponseEmpresaMessageDto,
} from './dto/response-empresa.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';
import { EmpresaService } from './empresa.service';
import { TenantContextService } from '@/auth/tenant-context/tenant-context.service';
import { PerfilService } from '../perfil/perfil.service';

@Controller('empresa')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EmpresaController {
  constructor(
    private readonly empresaService: EmpresaService,
    private readonly perfilService: PerfilService,
    private readonly tenantContext: TenantContextService,
  ) {}

  // CONTROLLER CRIAR EMPRESA
  @Post()
  @Roles(ROLES.ASN1)
  async create(
    @Body() createEmpresaDto: CreateEmpresaDto,
  ): Promise<ResponseEmpresaDto> {
    const dados = await this.empresaService.create(createEmpresaDto);
    return plainToInstance(ResponseEmpresaDto, dados);
  }

  // CONTROLLER LISTAR EMPRESAS
  @Get()
  @Roles(ROLES.ASN1)
  async findAll(
    @Query() query: QueryEmpresaFilterDto,
  ): Promise<ResponseEmpresaDto[]> {
    const dados = await this.empresaService.findAll(query);
    return plainToInstance(ResponseEmpresaDto, dados);
  }

  // LISTAR TODOS OS DADOS PARA TABELA LIST - RETORNA APENAS id, descrição e nivel
  @Get('list')
  @Roles(ROLES.ASN1, ROLES.ADN1)
  async findAllList(): Promise<ResponseEmpresaListDto[]> {
    const usuario = this.tenantContext.getStore()!;
    const codigo = await this.empresaService.findOne(usuario.empresa);
    const perfil = await this.perfilService.findOne(usuario.perfil);
    const desPerfil = `${perfil.descricao} - ${perfil.nivel}`;
    let query: QueryEmpresaFilterDto = {};
    if (desPerfil !== ROLES.ASN1) {
      query = { codigo: codigo.codigo };
    }
    const dados = await this.empresaService.findAll(query);
    return plainToInstance(ResponseEmpresaListDto, dados);
  }

  /*
  CONTADOR DE REGISTROS:
  - Retorna dados totais, ativos e inativos.
  - Apenas para Assistência.
  */
  @Get('counter')
  @Roles(ROLES.ASN1)
  async counter(): Promise<ResponseEmpresaContadorDto> {
    const contador = await this.empresaService.counter();
    return plainToInstance(ResponseEmpresaContadorDto, contador);
  }

  /*
  CONTADOR DE REGISTROS:
  - Retorna dados totais, ativos e inativos.
  - Apenas para Administradores e gestores.
  */
  @Get('counter_collaborators')
  @Roles(ROLES.ADN1)
  async counterCollaborators(): Promise<ResponseEmpresaContadorDto> {
    const contador = await this.empresaService.counterCollaborators();
    return plainToInstance(ResponseEmpresaContadorDto, contador);
  }

  // CONTROLLER BUSCAR EMPRESA PELO ID
  @Get(':id')
  @Roles(ROLES.ASN1, ROLES.ADN1)
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseEmpresaDto> {
    const dado = await this.empresaService.findOne(id);
    return plainToInstance(ResponseEmpresaDto, dado);
  }

  // CONTROLLER ATUALIZAR EMPRESA PELO ID
  @Patch(':id')
  @Roles(ROLES.ASN1, ROLES.ADN1)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateEmpresaDto: UpdateEmpresaDto,
  ): Promise<ResponseEmpresaDto> {
    const dado = await this.empresaService.update(id, updateEmpresaDto);
    return plainToInstance(ResponseEmpresaDto, dado);
  }

  // CONTROLLER ATIVAR EMPRESA PELO ID
  @Patch('active/:id')
  @Roles(ROLES.ASN1, ROLES.ADN1)
  async active(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseEmpresaDto> {
    const dado = await this.empresaService.active(id);
    return plainToInstance(ResponseEmpresaDto, dado);
  }

  // CONTROLLER INATIVAR EMPRESA PELO ID
  @Patch('deactive/:id')
  @Roles(ROLES.ASN1, ROLES.ADN1)
  async deactive(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseEmpresaDto> {
    const dado = await this.empresaService.deactive(id);
    return plainToInstance(ResponseEmpresaDto, dado);
  }

  // CONTROLLER DELETAR EMPRESA PELO ID
  @Delete(':id')
  @Roles(ROLES.ASN1)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseEmpresaDto> {
    const dado = await this.empresaService.remove(id);
    return plainToInstance(ResponseEmpresaDto, dado);
  }
}
