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
  Res,
  UseGuards,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import {
  CreateUsuarioDto,
  CreateUsuarioMaster,
} from './dto/create-usuario.dto';
import {
  ResponseUsuarioContadorDto,
  ResponseUsuarioDto,
  ResponseUsuarioRelacaoDto,
} from './dto/response-usuario.dto';
import {
  UpdateUsuarioDto,
  UpdateUsuarioPasswordDto,
  UpdateUsuarioPinDto,
} from './dto/update-usuario.dto';
import { UsuarioService } from './usuario.service';
import { QueryUsuarioFilterDto } from './dto/query-usuario.dto';
import { Auth } from '@/auth/entities/auth.entity';
import { AuthService } from '@/auth/auth.service';
import type { Response } from 'express';
import { GenerateTokenService } from '@/auth/jwt-generate-token/jwt-generate-token.service';
import { TenantContextService } from '@/auth/tenant-context/tenant-context.service';

@Controller('usuario')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsuarioController {
  constructor(
    private readonly usuarioService: UsuarioService,
    private readonly generateToken: GenerateTokenService,
  ) {}
  // CRIAR USUARIO MASTER
  @Post('master')
  @Public()
  async createMaster(
    @Body() createUsuarioMaster: CreateUsuarioMaster,
  ): Promise<ResponseUsuarioDto> {
    const dado = await this.usuarioService.createMaster(createUsuarioMaster);
    return plainToInstance(ResponseUsuarioDto, dado);
  }

  // CRIAR USUARIO
  @Post()
  @Roles(ROLES.ASN1, ROLES.ADN1)
  async create(@Body() create: CreateUsuarioDto): Promise<ResponseUsuarioDto> {
    const dado = await this.usuarioService.create(create);
    return plainToInstance(ResponseUsuarioDto, dado);
  }

  // LISTA OS USUARIOS
  @Get()
  @Roles(ROLES.ASN1, ROLES.ADN1)
  async findAll(
    @Query() query: QueryUsuarioFilterDto,
  ): Promise<ResponseUsuarioDto[]> {
    const dados = await this.usuarioService.findAll(query);
    return plainToInstance(ResponseUsuarioDto, dados);
  }

  // CONTADOR DE REGISTROS TOTAIS, ATIVOS E INATIVOS
  @Get('counter')
  @Roles(ROLES.ASN1, ROLES.ADN1)
  async counter(): Promise<ResponseUsuarioContadorDto> {
    const contador = await this.usuarioService.counter();
    return plainToInstance(ResponseUsuarioContadorDto, contador);
  }

  // BUSCA USUARIO PELO ID
  @Get(':id')
  @Roles(ROLES.ASN1, ROLES.ADN1)
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseUsuarioRelacaoDto> {
    const dado = await this.usuarioService.findOne(id);
    return plainToInstance(ResponseUsuarioRelacaoDto, dado);
  }

  // ATUALIZA O SENHA DO USUARIO
  @Patch('password')
  async updatePassword(
    @Body() updatePassword: UpdateUsuarioPasswordDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ResponseUsuarioDto> {
    const tipo = 'PAS';
    const dado = await this.usuarioService.updatePasswordPinUsuario(
      updatePassword,
      tipo,
    );

    const dadosToken: Auth = {
      userId: dado.id,
      perfil: dado.perfilId!,
      empresa: dado.empresaId!,
      versaoToken: dado.versaoToken,
    };

    const token = await this.generateToken.generateToken(dadosToken);

    res.cookie('jwt', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 24 * 60 * 60 * 1000,
    });

    return plainToInstance(ResponseUsuarioDto, dado);
  }

  // ATUALIZA O PIN DO USUARIO
  @Patch('pin')
  async updatePin(
    @Body() update: UpdateUsuarioPinDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ResponseUsuarioDto> {
    const tipo = 'PIN';
    const dado = await this.usuarioService.updatePasswordPinUsuario(
      update,
      tipo,
    );

    const dadosToken: Auth = {
      userId: dado.id,
      perfil: dado.perfilId!,
      empresa: dado.empresaId!,
      versaoToken: dado.versaoToken,
    };

    const token = await this.generateToken.generateToken(dadosToken);

    res.cookie('jwt', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 24 * 60 * 60 * 1000,
    });

    return plainToInstance(ResponseUsuarioDto, dado);
  }

  // ATUALIZA USUARIO PELO ID
  @Patch(':id')
  @Roles(ROLES.ASN1, ROLES.ADN1)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() update: UpdateUsuarioDto,
  ): Promise<ResponseUsuarioDto> {
    const dado = await this.usuarioService.update(id, update);
    return plainToInstance(ResponseUsuarioDto, dado);
  }

  // ATIVAR USUARIO
  @Patch('active/:id')
  @Roles(ROLES.ASN1, ROLES.ADN1)
  async active(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseUsuarioDto> {
    const dado = await this.usuarioService.active(id);
    return plainToInstance(ResponseUsuarioDto, dado);
  }

  // INATIVAR USUARIO
  @Patch('deactive/:id')
  @Roles(ROLES.ASN1, ROLES.ADN1)
  async deactive(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseUsuarioDto> {
    const dado = await this.usuarioService.deactive(id);
    return plainToInstance(ResponseUsuarioDto, dado);
  }

  // DELETA O USUARIO
  @Delete(':id')
  @Roles(ROLES.ASN1, ROLES.ADN1)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseUsuarioDto> {
    const dado = await this.usuarioService.remove(id);
    return plainToInstance(ResponseUsuarioDto, dado);
  }
}
