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
import { FalhasService } from './falhas.service';
import { CreateFalhaDto } from './dto/create-falha.dto';
import { UpdateFalhaDto } from './dto/update-falha.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/auth/guards/roles-auth.guard';
import { ResponseFalhasDto } from './dto/response-falhas.dto';
import { plainToInstance } from 'class-transformer';
import { ROLES } from '@/auth/guards/roles.const';
import { Roles } from '@/auth/guards/roles.decorator';
import { QueryFalhasFilterDto } from './dto/query-falhas.dto';

@Controller('falhas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FalhasController {
  constructor(private readonly falhasService: FalhasService) {}

  @Post()
  @Roles(ROLES.ASN1)
  async create(
    @Body() createFalhaDto: CreateFalhaDto,
  ): Promise<ResponseFalhasDto> {
    const dado = await this.falhasService.create(createFalhaDto);
    return plainToInstance(ResponseFalhasDto, dado);
  }

  @Get()
  @Roles(ROLES.ASN1)
  async findAll(
    @Query() query: QueryFalhasFilterDto,
  ): Promise<ResponseFalhasDto[]> {
    const dados = await this.falhasService.findAll(query);
    return plainToInstance(ResponseFalhasDto, dados);
  }

  @Get(':id')
  @Roles(ROLES.ASN1)
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseFalhasDto> {
    const dado = await this.falhasService.findOne(id);
    return plainToInstance(ResponseFalhasDto, dado);
  }

  @Patch(':id')
  @Roles(ROLES.ASN1)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateFalhaDto: UpdateFalhaDto,
  ): Promise<ResponseFalhasDto> {
    const dado = await this.falhasService.update(id, updateFalhaDto);
    return plainToInstance(ResponseFalhasDto, dado);
  }

  @Patch('deactive/:id')
  @Roles(ROLES.ASN1)
  async deactive(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseFalhasDto> {
    const dado = await this.falhasService.deactive(id);
    return plainToInstance(ResponseFalhasDto, dado);
  }

  @Delete(':id')
  @Roles(ROLES.ASN1)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseFalhasDto> {
    const dado = await this.falhasService.remove(id);
    return plainToInstance(ResponseFalhasDto, dado);
  }
}
