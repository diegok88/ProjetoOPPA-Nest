import type { AuthenticatedRequest } from '@/auth/express/authenticated-request.interface';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { Public } from '@/auth/guards/public.decorator';
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
import { QueryAdminDto, QueryUsuarioDto } from './dto/query-usuario.dto';
import { ResponseUsuarioDto } from './dto/response-usuario.dto';
import {
  UpdateUsuarioDto,
  UpdateUsuarioPasswordDto,
  UpdateUsuarioPinDto,
} from './dto/update-usuario.dto';
import { UsuarioService } from './usuario.service';

@Controller('usuario')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}
  // CRIAR USUARIO MASTER
  @Post('master')
  @Public()
  async createMaster(
    @Body() createUsuarioMaster: CreateUsuarioMaster,
  ): Promise<ResponseUsuarioDto> {
    const dado = await this.usuarioService.createMaster(createUsuarioMaster);
    return plainToClass(ResponseUsuarioDto, dado);
  }

  // CRIAR USUARIO COMO ASSISTENCIA
  @Post('assist')
  @Roles(ROLES.ASN1)
  async createAssist(
    @Body() create: CreateUsuarioAdmin,
  ): Promise<ResponseUsuarioDto> {
    const dado = await this.usuarioService.createAssist(create);
    return plainToClass(ResponseUsuarioDto, dado);
  }

  // CRIAR USUARIO COMO ADMINISTRADOR
  @Post('admin')
  @Roles(ROLES.ASN1)
  async createAdmin(
    @Body() create: CreateUsuarioAdmin,
  ): Promise<ResponseUsuarioDto> {
    const dado = this.usuarioService.createAdmin(create);
    return plainToClass(ResponseUsuarioDto, dado);
  }

  @Post('gestor')
  @Roles(ROLES.ASN1)
  async createGestor(
    @Body() create: CreateUsuarioAdmin,
  ): Promise<ResponseUsuarioDto> {
    const dado = this.usuarioService.createGestor(create);
    return plainToClass(ResponseUsuarioDto, dado);
  }

  // LISTA OS USUARIOS
  @Get()
  @Roles(ROLES.ASN1)
  async findAll(
    @Query() queryUsuarioDto: QueryUsuarioDto,
  ): Promise<ResponseUsuarioDto[]> {
    const dados = await this.usuarioService.findAll(queryUsuarioDto);
    return dados.map((lista) => plainToClass(ResponseUsuarioDto, lista));
  }

  // LISTA OS USUARIOS COM PARAMETROS ESPECIFICOS, MAIS USANDO O MESMO SERVIÇO
  @Get('admin')
  @Roles(ROLES.ASN1)
  async findAllAdmin(
    @Req() req: AuthenticatedRequest,
    @Query() query: QueryAdminDto,
  ): Promise<ResponseUsuarioDto[]> {
    const queryAdmin: QueryUsuarioDto = {
      ...query,
      empresaId: req.user.empresa,
      status: query.status ?? true,
      campos: query.campos ?? 'id,nome,cracha',
    };

    const dados = await this.usuarioService.findAll(queryAdmin);

    return dados.map((lista) => plainToClass(ResponseUsuarioDto, lista));
  }

  // BUSCA USUARIO PELO ID
  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseUsuarioDto> {
    const dado = await this.usuarioService.findOne(id);
    return plainToClass(ResponseUsuarioDto, dado);
  }

  // ATUALIZA USUARIO PELO ID
  @Patch(':id')
  @Roles(ROLES.ASN1)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() update: UpdateUsuarioDto,
  ): Promise<ResponseUsuarioDto> {
    const dado = await this.usuarioService.update(id, update);
    return plainToClass(ResponseUsuarioDto, dado);
  }

  // ATUALIZA O SENHA DO USUARIO
  @Post('password')
  async updatePassword(
    @Body() updatePassword: UpdateUsuarioPasswordDto,
  ): Promise<ResponseUsuarioDto> {
    console.log(updatePassword);
    const tipo = 'PAS';
    const dado = await this.usuarioService.updatePasswordPinUsuario(
      updatePassword,
      tipo,
    );
    return plainToClass(ResponseUsuarioDto, dado);
  }

  // ATUALIZA O PIN DO USUARIO
  @Post('pin')
  async updatePin(
    @Body() update: UpdateUsuarioPinDto,
  ): Promise<ResponseUsuarioDto> {
    const tipo = 'PIN';
    const dado = await this.usuarioService.updatePasswordPinUsuario(
      update,
      tipo,
    );
    return plainToClass(ResponseUsuarioDto, dado);
  }

  // INATIVAR USUARIO
  @Patch('deactive/:id')
  @Roles(ROLES.ASN1)
  async deactive(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseUsuarioDto> {
    const dado = await this.usuarioService.deactive(id);
    return plainToClass(ResponseUsuarioDto, dado);
  }

  // DELETA O USUARIO
  @Delete(':id')
  @Roles(ROLES.ASN1)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseUsuarioDto> {
    const dado = await this.usuarioService.remove(id);
    return plainToClass(ResponseUsuarioDto, dado);
  }
}
