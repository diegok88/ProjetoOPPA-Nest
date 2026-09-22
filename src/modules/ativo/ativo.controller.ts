import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { AtivoService } from './ativo.service';
import { CreateAtivoDto } from './dto/create-ativo.dto';
import { UpdateAtivoDto } from './dto/update-ativo.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/auth/guards/roles-auth.guard';
import { ResponseAtivoDto } from './dto/response-ativo.dto';
import { plainToInstance } from 'class-transformer';
import { ROLES } from '@/auth/guards/roles.const';
import { Roles } from '@/auth/guards/roles.decorator';
import { QueryAtivoFilterDto } from './dto/query-ativo.dto';

@Controller('ativo')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AtivoController {
  constructor(private readonly ativoService: AtivoService) {}

  @Post()
  @Roles(ROLES.ASN1)
  async create(
    @Body() createAtivoDto: CreateAtivoDto,
  ): Promise<ResponseAtivoDto> {
    const dado = await this.ativoService.create(createAtivoDto);
    return plainToInstance(ResponseAtivoDto, dado);
  }

  @Get()
  @Roles(ROLES.ASN1)
  async findAll(
    @Query() query: QueryAtivoFilterDto,
  ): Promise<ResponseAtivoDto[]> {
    const dados = await this.ativoService.findAll(query);
    return plainToInstance(ResponseAtivoDto, dados);
  }

  @Get(':id')
  @Roles(ROLES.ASN1)
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseAtivoDto> {
    const dado = await this.ativoService.findOne(id);
    return plainToInstance(ResponseAtivoDto, dado);
  }

  @Patch(':id')
  @Roles(ROLES.ASN1)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateAtivoDto: UpdateAtivoDto,
  ): Promise<ResponseAtivoDto> {
    const dado = await this.ativoService.update(id, updateAtivoDto);
    return plainToInstance(ResponseAtivoDto, dado);
  }

  @Patch('deactive/:id')
  @Roles(ROLES.ASN1)
  async deactive(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseAtivoDto> {
    const dado = await this.ativoService.deactive(id);
    return plainToInstance(ResponseAtivoDto, dado);
  }

  @Delete(':id')
  @Roles(ROLES.ASN1)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseAtivoDto> {
    const dado = await this.ativoService.remove(id);
    return plainToInstance(ResponseAtivoDto, dado);
  }
}
