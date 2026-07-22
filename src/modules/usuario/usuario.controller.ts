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
import {
  CreateUsuarioAdmin,
  CreateUsuarioDto,
  CreateUsuarioMaster,
} from './dto/create-usuario.dto';
import { ResponseActiveUsuario } from './dto/response-active-usuario.dto';
import { ResponseUsuarioDto } from './dto/response-usuario.dto';
import { UpdateDataUsuarioDto } from './dto/update-data-usuario.dto';
import { UpdatePasswordUsuarioDto } from './dto/update-password-usuario.dto';
import { UpdatePinUsuarioDto } from './dto/update-pin-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { UsuarioService } from './usuario.service';

@Controller('usuario')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}
  // CRIAR USUARIO MASTER
  @Post('master')
  async createMaster(
    @Body() createUsuarioMaster: CreateUsuarioMaster,
  ): Promise<ResponseUsuarioDto> {
    return this.usuarioService.createMaster(createUsuarioMaster);
  }
  // CRIAR USUARIO ADMINISTRADOR
  @Post('admin')
  async createAdmin(
    @Body() createUsuarioAdmin: CreateUsuarioAdmin,
  ): Promise<ResponseUsuarioDto> {
    return this.usuarioService.createAdmin(createUsuarioAdmin);
  }
  // LISTA OS USUARIOS
  @Get()
  async findAll(): Promise<ResponseUsuarioDto[]> {
    return this.usuarioService.findAll();
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
  ): Promise<ResponseUsuarioDto> {
    return this.usuarioService.deactive(id);
  }
  // DELETA O USUARIO
  @Delete(':id')
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseUsuarioDto> {
    return this.usuarioService.remove(id);
  }
}
