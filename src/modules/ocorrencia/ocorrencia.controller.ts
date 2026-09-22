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
import { OcorrenciaService } from './ocorrencia.service';
import { CreateOcorrenciaDto } from './dto/create-ocorrencia.dto';
import { UpdateOcorrenciaDto } from './dto/update-ocorrencia.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/auth/guards/roles-auth.guard';
import { ResponseOcorrenciaDto } from './dto/response-ocorrencia.dto';
import { plainToInstance } from 'class-transformer';
import { ROLES } from '@/auth/guards/roles.const';
import { Roles } from '@/auth/guards/roles.decorator';
import { QueryOcorrenciaFilterDto } from './dto/query-ocorrencia.dto';

@Controller('ocorrencia')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OcorrenciaController {
  constructor(private readonly ocorrenciaService: OcorrenciaService) {}

  @Post()
  @Roles(ROLES.ASN1)
  async create(
    @Body() createOcorrenciaDto: CreateOcorrenciaDto,
  ): Promise<ResponseOcorrenciaDto> {
    const dado = await this.ocorrenciaService.create(createOcorrenciaDto);
    return plainToInstance(ResponseOcorrenciaDto, dado);
  }

  @Get()
  @Roles(ROLES.ASN1)
  async findAll(
    @Query() query: QueryOcorrenciaFilterDto,
  ): Promise<ResponseOcorrenciaDto[]> {
    const dados = await this.ocorrenciaService.findAll(query);
    return plainToInstance(ResponseOcorrenciaDto, dados);
  }

  @Get(':id')
  @Roles(ROLES.ASN1)
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseOcorrenciaDto> {
    const dado = await this.ocorrenciaService.findOne(id);
    return plainToInstance(ResponseOcorrenciaDto, dado);
  }

  @Patch(':id')
  @Roles(ROLES.ASN1)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateOcorrenciaDto: UpdateOcorrenciaDto,
  ): Promise<ResponseOcorrenciaDto> {
    const dado = await this.ocorrenciaService.update(id, updateOcorrenciaDto);
    return plainToInstance(ResponseOcorrenciaDto, dado);
  }

  @Patch('deactive/:id')
  @Roles(ROLES.ASN1)
  async deactive(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseOcorrenciaDto> {
    const dado = await this.ocorrenciaService.deactive(id);
    return plainToInstance(ResponseOcorrenciaDto, dado);
  }

  @Delete(':id')
  @Roles(ROLES.ASN1)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseOcorrenciaDto> {
    const dado = await this.ocorrenciaService.remove(id);
    return plainToInstance(ResponseOcorrenciaDto, dado);
  }
}
