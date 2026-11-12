import { ROLES } from '@/auth/guards/roles.const';
import { Roles } from '@/auth/guards/roles.decorator';
import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { ContadorCrachaService } from './contador-cracha.service';
import { QueryContadorCrachaFilterDto } from './dto/query-contador-cracha.dto';
import { ResponseContadorCrachaDto } from './dto/response-contador-cracha.dto';
import { HttpJwtGuard } from '@/auth/guards/http-jwt.guard';
import { HttpRolesGuard } from '@/auth/guards/http-roles.guard';

@Controller('contador-cracha')
@UseGuards(HttpJwtGuard, HttpRolesGuard)
export class ContadorCrachaController {
  constructor(private readonly contadorCrachaService: ContadorCrachaService) {}

  @Get()
  @Roles(ROLES.ASN1)
  async findAll(
    @Query() query: QueryContadorCrachaFilterDto,
  ): Promise<ResponseContadorCrachaDto[]> {
    const dados = await this.contadorCrachaService.findAll(query);
    return plainToInstance(ResponseContadorCrachaDto, dados);
  }

  @Get(':id')
  @Roles(ROLES.ASN1)
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseContadorCrachaDto> {
    const dado = await this.contadorCrachaService.findOne(id);
    return plainToInstance(ResponseContadorCrachaDto, dado);
  }
}
