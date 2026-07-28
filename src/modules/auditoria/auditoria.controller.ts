import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/auth/guards/roles-auth.guard';
import { ROLES } from '@/auth/guards/roles.const';
import { Roles } from '@/auth/guards/roles.decorator';
import { TYPES_NOTICES } from '@/utils/types-notices.cosnt';
import {
  Controller,
  Delete,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { AuditoriaService } from './auditoria.service';
import { QueryAuditoriaFilterDto } from './dto/query-auditoria.dto';
import {
  ResponseAuditoriaDto,
  ResponseAuditoriaMessageDto,
} from './dto/response-auditoria.dto';

@Controller('auditoria')
export class AuditoriaController {
  constructor(private readonly auditoriaService: AuditoriaService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.ASN1)
  async findAll(
    @Query() query: QueryAuditoriaFilterDto,
  ): Promise<ResponseAuditoriaDto[]> {
    const dados = await this.auditoriaService.findAll(query);
    return dados.map((lista) => plainToClass(ResponseAuditoriaDto, lista));
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @Roles(ROLES.ASN1)
  async findOne(@Param('id') id: string): Promise<ResponseAuditoriaDto> {
    const dado = this.auditoriaService.findOne(id);
    return plainToClass(ResponseAuditoriaDto, dado);
  }

  @Delete(':id')
  @Roles(ROLES.ASN1)
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string): Promise<ResponseAuditoriaMessageDto> {
    const dado = this.auditoriaService.remove(id);
    return plainToClass(ResponseAuditoriaMessageDto, {
      message: TYPES_NOTICES.DELETE,
    });
  }
}
