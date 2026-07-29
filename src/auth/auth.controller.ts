import { TYPES_NOTICES } from '@/utils/types-notices.cosnt';
import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto, LogoutDto } from './dto/create-auth.dto';
import {
  ResponseAuthDto,
  ResponseAuthMessageDto,
} from './dto/response-auth.dto';
import type { AuthenticatedRequest } from './express/authenticated-request.interface';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ResponseAuthMessageDto> {
    const token = await this.authService.login(loginDto);
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    });
    return plainToClass(ResponseAuthMessageDto, TYPES_NOTICES.LOGIN);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(
    @Res({ passthrough: true }) res: Response,
    @Req() req: AuthenticatedRequest,
  ): Promise<ResponseAuthMessageDto> {
    const usuario: LogoutDto = {
      usuarioId: req.user.userId,
      empresaId: req.user.empresa,
    };
    await this.authService.logout(usuario);
    res.clearCookie('jwt');
    return plainToClass(ResponseAuthMessageDto, TYPES_NOTICES.LOGOUT);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getIt(@Req() req: AuthenticatedRequest): Promise<ResponseAuthDto> {
    return this.authService.findProfile(req.user.userId);
  }
}
