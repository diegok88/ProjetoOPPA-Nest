import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { GestorService } from './gestor.service';
import { QueryGestorFilterDto } from './dto/query-gestor.dto';
import { ResponseGestorDto } from './dto/response-gestor.dto';
import { plainToClass } from 'class-transformer';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/auth/guards/roles-auth.guard';
import { ROLES } from '@/auth/guards/roles.const';
import { Roles } from '@/auth/guards/roles.decorator';

@Controller('gestor')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GestorController {
  constructor(private readonly gestorService: GestorService) {}

  @Get()
  @Roles(ROLES.ASN1)
  async findAll(
    @Query() query: QueryGestorFilterDto,
  ): Promise<ResponseGestorDto[]> {
    const dados = await this.gestorService.findAll(query);
    return dados.map((lista) => plainToClass(ResponseGestorDto, lista));
  }

  @Get(':id')
  @Roles(ROLES.ASN1)
  async findOne(@Param('id') id: string): Promise<ResponseGestorDto> {
    const dado = this.gestorService.findOne(id);
    return plainToClass(ResponseGestorDto, dado);
  }
}
