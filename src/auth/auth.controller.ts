import { TYPES_NOTICES } from '@/utils/types-notices.cosnt';
import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/create-auth.dto';
import {
  ResponseAuthDto,
  ResponseAuthMessageDto,
} from './dto/response-auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Public } from './guards/public.decorator';
import { TenantContextService } from './tenant-context/tenant-context.service';
import { UserContext } from './tenant-context/user-context.interface';

@Controller('auth')
@UseGuards(JwtAuthGuard)
export class AuthController {
  private logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly tenantContext: TenantContextService,
  ) {}

  @Post('login')
  @Public()
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
    return plainToClass(ResponseAuthMessageDto, {
      message: TYPES_NOTICES.LOGIN,
    });
  }

  @Post('logout')
  async logout(
    @Res({ passthrough: true }) res: Response,
  ): Promise<ResponseAuthMessageDto> {
    const usuario: UserContext = this.tenantContext.getStore()!;
    await this.authService.logout(usuario);
    res.clearCookie('jwt');
    return plainToClass(ResponseAuthMessageDto, TYPES_NOTICES.LOGOUT);
  }

  @Get('profile')
  async getIt(): Promise<ResponseAuthDto> {
    const usuario = this.tenantContext.getStore()!;
    this.logger.log('getIt()');
    return this.authService.findProfile(usuario.user);
  }
}
