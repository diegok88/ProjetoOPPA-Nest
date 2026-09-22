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
import { FluxoOcorrenciaService } from './fluxo-ocorrencia.service';
import { CreateFluxoOcorrenciaDto } from './dto/create-fluxo-ocorrencia.dto';
import { UpdateFluxoOcorrenciaDto } from './dto/update-fluxo-ocorrencia.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/auth/guards/roles-auth.guard';
import { ResponseFluxoOcorrenciaDto } from './dto/response-fluxo-ocorrencia.dto';
import { plainToInstance } from 'class-transformer';
import { ROLES } from '@/auth/guards/roles.const';
import { Roles } from '@/auth/guards/roles.decorator';
import { QueryFluxoOcorrenciaFilterDto } from './dto/query-fluxo-ocorrencia.dto';

@Controller('fluxo-ocorrencia')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FluxoOcorrenciaController {
  constructor(
    private readonly fluxoOcorrenciaService: FluxoOcorrenciaService,
  ) {}

  @Post()
  @Roles(ROLES.ASN1)
  async create(
    @Body() createFluxoOcorrenciaDto: CreateFluxoOcorrenciaDto,
  ): Promise<ResponseFluxoOcorrenciaDto> {
    const dado = await this.fluxoOcorrenciaService.create(
      createFluxoOcorrenciaDto,
    );
    return plainToInstance(ResponseFluxoOcorrenciaDto, dado);
  }

  @Get()
  @Roles(ROLES.ASN1)
  async findAll(
    @Query() query: QueryFluxoOcorrenciaFilterDto,
  ): Promise<ResponseFluxoOcorrenciaDto[]> {
    const dados = await this.fluxoOcorrenciaService.findAll(query);
    return plainToInstance(ResponseFluxoOcorrenciaDto, dados);
  }

  @Get(':id')
  @Roles(ROLES.ASN1)
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseFluxoOcorrenciaDto> {
    const dado = await this.fluxoOcorrenciaService.findOne(id);
    return plainToInstance(ResponseFluxoOcorrenciaDto, dado);
  }

  @Patch(':id')
  @Roles(ROLES.ASN1)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateFluxoOcorrenciaDto: UpdateFluxoOcorrenciaDto,
  ): Promise<ResponseFluxoOcorrenciaDto> {
    const dado = await this.fluxoOcorrenciaService.update(
      id,
      updateFluxoOcorrenciaDto,
    );
    return plainToInstance(ResponseFluxoOcorrenciaDto, dado);
  }

  @Patch('deactive/:id')
  @Roles(ROLES.ASN1)
  async deactive(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseFluxoOcorrenciaDto> {
    const dado = await this.fluxoOcorrenciaService.deactive(id);
    return plainToInstance(ResponseFluxoOcorrenciaDto, dado);
  }

  @Delete(':id')
  @Roles(ROLES.ASN1)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseFluxoOcorrenciaDto> {
    const dado = await this.fluxoOcorrenciaService.remove(id);
    return plainToInstance(ResponseFluxoOcorrenciaDto, dado);
  }
}
