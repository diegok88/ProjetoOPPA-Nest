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
import { CreatePerfilDto } from './dto/create-perfil.dto';
import { ResponsePerfilDto } from './dto/response-perfil.dto';
import { UpdatePerfilDto } from './dto/update-perfil.dto';
import { PerfilService } from './perfil.service';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/auth/guards/roles-auth.guard';
import { ROLES } from '@/auth/guards/roles.const';
import { Roles } from '@/auth/guards/roles.decorator';
import type { AuthenticatedRequest } from '@/auth/express/authenticated-request.interface';
import { plainToClass } from 'class-transformer';
import { Auth } from '@/auth/entities/auth.entity';
import { QueryPerfilFilterDto } from './dto/query-perfil.dto';

@Controller('perfil')
export class PerfilController {
  constructor(private readonly perfilService: PerfilService) {}

  // CRIAR PERFIL
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.ASN1)
  async create(
    @Req() req: AuthenticatedRequest,
    @Body() createPerfilDto: CreatePerfilDto,
  ): Promise<ResponsePerfilDto> {
    const autenticado: Auth = req.user;
    const dado = await this.perfilService.create(autenticado, createPerfilDto);
    return plainToClass(ResponsePerfilDto, dado);
  }

  // LISTAR PERFIS
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.ASN1)
  async findAll(
    @Query() query: QueryPerfilFilterDto,
  ): Promise<ResponsePerfilDto[]> {
    const dados = await this.perfilService.findAll(query);
    return dados.map((lista) => plainToClass(ResponsePerfilDto, lista));
  }

  // BUSCAR PERFIL PELO ID
  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.ASN1)
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponsePerfilDto> {
    const dado = await this.perfilService.findOne(id);
    return plainToClass(ResponsePerfilDto, dado);
  }

  // ATUALIZAÇÃO DO PERFIL PELO ID
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.ASN1)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthenticatedRequest,
    @Body() updatePerfilDto: UpdatePerfilDto,
  ): Promise<ResponsePerfilDto> {
    const autenticado: Auth = req.user;
    const dado = await this.perfilService.update(
      id,
      autenticado,
      updatePerfilDto,
    );
    return plainToClass(ResponsePerfilDto, dado);
  }

  // INATIVAÇÃO DO PERFIL PELO ID
  @Patch('deactive/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.ASN1)
  async deactive(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<ResponsePerfilDto> {
    const autenticado: Auth = req.user;
    const dado = await this.perfilService.deactive(id, autenticado);
    return plainToClass(ResponsePerfilDto, dado);
  }

  // DELETE DO PERFIL PELO ID
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.ASN1)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<ResponsePerfilDto> {
    const autenticado: Auth = req.user;
    const dado = await this.perfilService.remove(id, autenticado);
    return plainToClass(ResponsePerfilDto, dado);
  }
}
