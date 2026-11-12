import { HttpRolesGuard } from '@/auth/guards/http-roles.guard';
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
import { plainToInstance } from 'class-transformer';
import { AuditoriaService } from './auditoria.service';
import { QueryAuditoriaFilterDto } from './dto/query-auditoria.dto';
import {
  ResponseAuditoriaDto,
  ResponseAuditoriaMessageDto,
} from './dto/response-auditoria.dto';
import { HttpJwtGuard } from '@/auth/guards/http-jwt.guard';

@Controller('auditoria')
@UseGuards(HttpJwtGuard, HttpRolesGuard)
export class AuditoriaController {
  constructor(private readonly auditoriaService: AuditoriaService) {}

  @Get()
  @Roles(ROLES.ASN1, ROLES.ADN1, ROLES.GER1, ROLES.SUP1)
  async findAll(
    @Query() query: QueryAuditoriaFilterDto,
  ): Promise<ResponseAuditoriaDto[]> {
    const dados = await this.auditoriaService.findAll(query);
    return plainToInstance(ResponseAuditoriaDto, dados);
  }

  @Get(':id')
  @Roles(ROLES.ASN1, ROLES.ADN1, ROLES.GER1, ROLES.SUP1)
  async findOne(@Param('id') id: string): Promise<ResponseAuditoriaDto> {
    const dado = await this.auditoriaService.findOne(id);
    return plainToInstance(ResponseAuditoriaDto, dado);
  }

  @Delete(':id')
  @Roles(ROLES.ASN1)
  async remove(@Param('id') id: string): Promise<ResponseAuditoriaMessageDto> {
    const dado = await this.auditoriaService.remove(id);
    return plainToInstance(ResponseAuditoriaMessageDto, {
      message: TYPES_NOTICES.DELETE,
    });
  }
}
