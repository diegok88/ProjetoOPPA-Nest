import type { AuthenticatedRequest } from '@/auth/express/authenticated-request.interface';
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
  Req,
  UseGuards,
} from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import {
  CreateUsuarioAdmin,
  CreateUsuarioMaster,
} from './dto/create-usuario.dto';
import { DeleteUsuarioDto } from './dto/delete-usuario.dto';
import { QueryAdminDto, QueryUsuarioDto } from './dto/query-usuario.dto';
import { ResponseActiveUsuario } from './dto/response-active-usuario.dto';
import { ResponseUsuarioDto } from './dto/response-usuario.dto';
import { UpdateDataUsuarioDto } from './dto/update-data-usuario.dto';
import { UpdatePasswordUsuarioDto } from './dto/update-password-usuario.dto';
import { UpdatePinUsuarioDto } from './dto/update-pin-usuario.dto';
import {
  UpdateUsuarioDeactiveDto,
  UpdateUsuarioDto,
} from './dto/update-usuario.dto';
import { UsuarioService } from './usuario.service';

@Controller('usuario')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}
  // CRIAR USUARIO MASTER
  @Post('master')
  async createMaster(
    @Body() createUsuarioMaster: CreateUsuarioMaster,
  ): Promise<ResponseUsuarioDto> {
    const dado = await this.usuarioService.createMaster(createUsuarioMaster);
    return plainToClass(ResponseUsuarioDto, dado);
  }

  // CRIAR USUARIO ADMINISTRADOR
  @Post('assist')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.ASN1)
  async createAssist(
    @Req() req: AuthenticatedRequest,
    @Body() create: CreateUsuarioAdmin,
  ): Promise<ResponseUsuarioDto> {
    const autenticado = req.user;
    const dado = await this.usuarioService.createAssist(autenticado, create);
    return plainToClass(ResponseUsuarioDto, dado);
  }

  // CRIAR USUARIO ADMINISTRADOR
  @Post('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.ASN1)
  async createAdmin(
    @Req() req: AuthenticatedRequest,
    @Body() create: CreateUsuarioAdmin,
  ): Promise<ResponseUsuarioDto> {
    const autenticado = req.user;
    return this.usuarioService.createAdmin(autenticado, create);
  }
  // LISTA OS USUARIOS
  @Get()
  async findAll(
    @Query() queryUsuarioDto: QueryUsuarioDto,
  ): Promise<ResponseUsuarioDto[]> {
    return this.usuarioService.findAll(queryUsuarioDto);
  }

  // LISTA OS USUARIOS COM PARAMETROS ESPECIFICOS, MAIS USANDO O MESMO SERVIÇO
  @Get('admin')
  async findAllAdmin(
    @Query() queryAdminDto: QueryAdminDto,
  ): Promise<ResponseUsuarioDto[]> {
    const queryUsuarioDto: QueryUsuarioDto = {
      empresaId: queryAdminDto.empresaId,
      perfilId: queryAdminDto.perfilId,
      status: queryAdminDto.status ?? true,
      campos: queryAdminDto.campos ?? 'id,nome,cracha',
    };

    return this.usuarioService.findAll(queryUsuarioDto);
  }

  @Get('findAllActive')
  async findAllActive(): Promise<ResponseActiveUsuario[]> {
    return this.usuarioService.findAllActive();
  }
  // BUSCA USUARIO PELO ID
  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseUsuarioDto> {
    return this.usuarioService.findOne(id);
  }
  // ATUALIZA USUARIO PELO ID
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUsuarioDto: UpdateUsuarioDto,
  ): Promise<ResponseUsuarioDto> {
    return this.usuarioService.update(id, updateUsuarioDto);
  }
  // ATUALIZAR DADOS DO USUARIO - menos senha e pin
  @Patch('updateData/:id')
  async updateDataUsuario(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDataUsuarioDto: UpdateDataUsuarioDto,
  ): Promise<ResponseUsuarioDto> {
    return this.usuarioService.updateDataUsuario(id, updateDataUsuarioDto);
  }
  // ATUALIZAR SENHA
  @Patch('updatePassword/:id')
  async updatePasswordUsuario(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePassword: UpdatePasswordUsuarioDto,
  ): Promise<ResponseUsuarioDto> {
    return this.usuarioService.updatePasswordUsuario(id, updatePassword);
  }
  // ATUALIZAR PIN
  @Patch('updatePin/:id')
  async updatePinUsuario(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePin: UpdatePinUsuarioDto,
  ): Promise<ResponseUsuarioDto> {
    return this.usuarioService.updatePinUsuario(id, updatePin);
  }
  // INATIVAR USUARIO
  @Patch('deactive/:id')
  async deactive(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUsuarioDeactiveDto: UpdateUsuarioDeactiveDto,
  ): Promise<ResponseUsuarioDto> {
    return this.usuarioService.deactive(id, updateUsuarioDeactiveDto);
  }
  // DELETA O USUARIO
  @Delete(':id')
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() deleteUsuarioDto: DeleteUsuarioDto,
  ): Promise<ResponseUsuarioDto> {
    return this.usuarioService.remove(id, deleteUsuarioDto);
  }
}
