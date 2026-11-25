import { TYPES_NOTICES } from '@/utils/types-notices.cosnt';
import { Body, Controller, Get, Logger, Post, Req, Res } from '@nestjs/common';
import { plainToClass, plainToInstance } from 'class-transformer';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import {
  ResponseAuthDto,
  ResponseAuthMessageDto,
  ResponseLoginDto,
  ResponseUsuarioAutenticar,
} from './dto/response-auth.dto';
import { Public } from './guards/public.decorator';
import {
  AutenticarAcaoDto,
  LoginColaboradorDto,
  LoginTagAtivoDto,
} from './dto/create-auth.dto';
import {
  getJwtClearCookieOptions,
  getJwtCookieOptions,
} from './jwt-generate-token/jwt-cookie.config';
import { AuthUser } from './entities/auth-user.interface';

@Controller('auth')
export class AuthController {
  private logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Public()
  async login(
    @Body() loginDto: LoginColaboradorDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ResponseLoginDto> {
    const token = await this.authService.login(loginDto);
    res.cookie('jwt', token, getJwtCookieOptions());
    return plainToClass(ResponseLoginDto, {
      message: TYPES_NOTICES.LOGIN,
      accessToken: token,
    });
  }

  @Post('login_tag')
  @Public()
  async loginTag(
    @Body() loginDto: LoginTagAtivoDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ResponseLoginDto> {
    const token = await this.authService.loginTag(loginDto);
    res.cookie('jwt', token, getJwtCookieOptions());
    return plainToClass(ResponseLoginDto, {
      message: TYPES_NOTICES.LOGIN,
      accessToken: token,
    });
  }

  @Post('logout')
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ResponseAuthMessageDto> {
    await this.authService.logout(req.user as AuthUser);
    res.clearCookie('jwt', getJwtClearCookieOptions());
    return plainToClass(ResponseAuthMessageDto, {
      message: TYPES_NOTICES.LOGOUT,
    });
  }

  @Post('autenticar')
  async AutenticarAcao(
    @Body() autenticar: AutenticarAcaoDto,
  ): Promise<ResponseUsuarioAutenticar> {
    const autenticado = await this.authService.authenticateAction(autenticar);
    return plainToInstance(ResponseUsuarioAutenticar, autenticado);
  }

  @Get('profile')
  async getIt(@Req() req: Request): Promise<ResponseAuthDto> {
    const usuario = req.user as AuthUser;
    this.logger.log('getIt()');
    const perfil = await this.authService.findProfile(usuario.userId);
    return plainToInstance(ResponseAuthDto, perfil);
  }
}
