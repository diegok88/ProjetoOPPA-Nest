import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/auth/guards/roles-auth.guard';
import { ROLES } from '@/auth/guards/roles.const';
import { Roles } from '@/auth/guards/roles.decorator';
import {
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuditoriaService } from './auditoria.service';
import { QueryAuditoriaFilterDto } from './dto/query-auditoria.dto';
import { ResponseAuditoriaDto } from './dto/response-auditoria.dto';

@Controller('auditoria')
@UseInterceptors(ClassSerializerInterceptor)
export class AuditoriaController {
  constructor(private readonly auditoriaService: AuditoriaService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.ASN1)
  async findAll(
    @Query() query: QueryAuditoriaFilterDto,
  ): Promise<ResponseAuditoriaDto[]> {
    return this.auditoriaService.findAll(query);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @Roles(ROLES.ASN1)
  async findOne(@Param('id') id: string): Promise<ResponseAuditoriaDto> {
    return this.auditoriaService.findOne(id);
  }

  @Delete(':id')
  @Roles(ROLES.ASN1)
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    return this.auditoriaService.remove(id);
  }
}
