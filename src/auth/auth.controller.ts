import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
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
    @Req() req: AuthenticatedRequest,
  ): Promise<{ message: string; usuario: number }> {
    return this.authService.login(res, req, loginDto);
  }

  @Post('logout')
  async logout(
    @Req() req: AuthenticatedRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ message: string }> {
    return this.authService.logout(res, req);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getIt(@Req() req: AuthenticatedRequest): Promise<ResponseAuthDto> {
    return this.authService.findProfile(req.user.userId);
  }
}
