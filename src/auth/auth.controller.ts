import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/create-auth.dto';
import { ResponseAuthDto } from './dto/response-auth.dto';
import type { AuthenticatedRequest } from './express/authenticated-request.interface';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ message: string; usuario: number }> {
    const resultado = await this.authService.login(loginDto);
    const token = resultado.token;

    res.cookie('jwt', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    });

    return { message: 'Autenticado com sucesso!', usuario: resultado.dado };
  }

  @Post('logout')
  async logout(
    @Req() req: AuthenticatedRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ message: string }> {
    const usuario: string = req.user.userId;

    const message = await this.authService.logout(usuario);

    res.clearCookie('jwt');

    return message;
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getIt(@Req() req: AuthenticatedRequest): Promise<ResponseAuthDto> {
    return this.authService.findProfile(req.user.userId);
  }
}
