import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/auth/guards/roles-auth.guard';
import { ROLES } from '@/auth/guards/roles.const';
import { Roles } from '@/auth/guards/roles.decorator';
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
import { plainToInstance } from 'class-transformer';
import { CreatePerfilDto } from './dto/create-perfil.dto';
import { QueryPerfilFilterDto } from './dto/query-perfil.dto';
import {
  ResponsePerfilContadorDto,
  ResponsePerfilDto,
  ResponsePerfilListDto,
} from './dto/response-perfil.dto';
import { UpdatePerfilDto } from './dto/update-perfil.dto';
import { PerfilService } from './perfil.service';

@Controller('perfil')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PerfilController {
  constructor(private readonly perfilService: PerfilService) {}

  // CRIAR PERFIL
  @Post()
  @Roles(ROLES.ASN1)
  async create(
    @Body() createPerfilDto: CreatePerfilDto,
  ): Promise<ResponsePerfilDto> {
    const dado = await this.perfilService.create(createPerfilDto);
    return plainToInstance(ResponsePerfilDto, dado);
  }

  // LISTAR TODOS OS PERFIS
  @Get()
  @Roles(ROLES.ASN1)
  async findAll(
    @Query() query: QueryPerfilFilterDto,
  ): Promise<ResponsePerfilDto[]> {
    const dados = await this.perfilService.findAll(query);
    return plainToInstance(ResponsePerfilDto, dados);
  }

  // LISTAR TODOS OS PERFIS PARA TABELA LIST - RETORNA APENAS id, descrição e nivel
  @Get('list')
  @Roles(ROLES.ASN1)
  async findAllList(
    @Query() query: QueryPerfilFilterDto,
  ): Promise<ResponsePerfilListDto[]> {
    const dados = await this.perfilService.findAll(query);
    return plainToInstance(ResponsePerfilListDto, dados);
  }

  // BUSCAR PERFIL PELO ID
  @Get(':id')
  @Roles(ROLES.ASN1)
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponsePerfilDto> {
    const dado = await this.perfilService.findOne(id);
    return plainToInstance(ResponsePerfilDto, dado);
  }

  // CONTADOR DE REGISTROS TOTAIS, ATIVOS E INATIVOS
  @Get('counter')
  @Roles(ROLES.ASN1)
  async counter(): Promise<ResponsePerfilContadorDto> {
    const contador = await this.perfilService.counter();
    return plainToInstance(ResponsePerfilContadorDto, contador);
  }

  // ATUALIZAÇÃO DO PERFIL PELO ID
  @Patch(':id')
  @Roles(ROLES.ASN1)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePerfilDto: UpdatePerfilDto,
  ): Promise<ResponsePerfilDto> {
    const dado = await this.perfilService.update(id, updatePerfilDto);
    return plainToInstance(ResponsePerfilDto, dado);
  }

  // ATIVAÇÃO DO PERFIL PELO ID
  @Patch('active/:id')
  @Roles(ROLES.ASN1)
  async active(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponsePerfilDto> {
    const dado = await this.perfilService.active(id);
    return plainToInstance(ResponsePerfilDto, dado);
  }

  // INATIVAÇÃO DO PERFIL PELO ID
  @Patch('deactive/:id')
  @Roles(ROLES.ASN1)
  async deactive(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponsePerfilDto> {
    const dado = await this.perfilService.deactive(id);
    return plainToInstance(ResponsePerfilDto, dado);
  }

  // DELETE DO PERFIL PELO ID
  @Delete(':id')
  @Roles(ROLES.ASN1)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponsePerfilDto> {
    const dado = await this.perfilService.remove(id);
    return plainToInstance(ResponsePerfilDto, dado);
  }
}
