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
import { TagAtivoService } from './tag-ativo.service';
import { CreateTagAtivoDto } from './dto/create-tag-ativo.dto';
import { UpdateTagAtivoDto } from './dto/update-tag-ativo.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/auth/guards/roles-auth.guard';
import { ResponseTagAtivoDto } from './dto/response-tag-ativo.dto';
import { plainToInstance } from 'class-transformer';
import { ROLES } from '@/auth/guards/roles.const';
import { Roles } from '@/auth/guards/roles.decorator';
import { QueryTagAtivoFilterDto } from './dto/query-tag-ativo.dto';

@Controller('tag-ativo')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TagAtivoController {
  constructor(private readonly tagAtivoService: TagAtivoService) {}

  @Post()
  @Roles(ROLES.ASN1)
  async create(
    @Body() createTagAtivoDto: CreateTagAtivoDto,
  ): Promise<ResponseTagAtivoDto> {
    const dado = await this.tagAtivoService.create(createTagAtivoDto);
    return plainToInstance(ResponseTagAtivoDto, dado);
  }

  @Get()
  @Roles(ROLES.ASN1)
  async findAll(
    @Query() query: QueryTagAtivoFilterDto,
  ): Promise<ResponseTagAtivoDto[]> {
    const dados = await this.tagAtivoService.findAll(query);
    return plainToInstance(ResponseTagAtivoDto, dados);
  }

  @Get(':id')
  @Roles(ROLES.ASN1)
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseTagAtivoDto> {
    const dado = await this.tagAtivoService.findOne(id);
    return plainToInstance(ResponseTagAtivoDto, dado);
  }

  @Patch(':id')
  @Roles(ROLES.ASN1)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTagAtivoDto: UpdateTagAtivoDto,
  ): Promise<ResponseTagAtivoDto> {
    const dado = await this.tagAtivoService.update(id, updateTagAtivoDto);
    return plainToInstance(ResponseTagAtivoDto, dado);
  }

  @Patch('deactive/:id')
  @Roles(ROLES.ASN1)
  async deactive(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseTagAtivoDto> {
    const dado = await this.tagAtivoService.deactive(id);
    return plainToInstance(ResponseTagAtivoDto, dado);
  }

  @Delete(':id')
  @Roles(ROLES.ASN1)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseTagAtivoDto> {
    const dado = await this.tagAtivoService.remove(id);
    return plainToInstance(ResponseTagAtivoDto, dado);
  }
}
