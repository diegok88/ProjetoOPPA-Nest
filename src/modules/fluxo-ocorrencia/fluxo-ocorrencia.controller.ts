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
import {
  ResponseFluxoOcorrenciaDto,
  ResponseFluxoOcorrenciaPaginadaDto,
  ResponseFluxoOcorrenciaRelacaoDto,
} from './dto/response-fluxo-ocorrencia.dto';
import { plainToInstance } from 'class-transformer';
import { ROLES } from '@/auth/guards/roles.const';
import { Roles } from '@/auth/guards/roles.decorator';
import { QueryFluxoOcorrenciaFilterDto } from './dto/query-fluxo-ocorrencia.dto';
import { HttpJwtGuard } from '@/auth/guards/http-jwt.guard';
import { HttpRolesGuard } from '@/auth/guards/http-roles.guard';

@Controller('fluxo-ocorrencia')
@UseGuards(HttpJwtGuard, HttpRolesGuard)
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
  @Roles(ROLES.ASN1, ROLES.TER1)
  async findAllPagination(
    @Query() query: QueryFluxoOcorrenciaFilterDto,
  ): Promise<ResponseFluxoOcorrenciaPaginadaDto> {
    const resultado =
      await this.fluxoOcorrenciaService.findAllPagination(query);
    return plainToInstance(ResponseFluxoOcorrenciaPaginadaDto, resultado);
  }

  @Get('listar')
  @Roles(ROLES.ASN1, ROLES.TER1)
  async findAllList(
    @Query() query: QueryFluxoOcorrenciaFilterDto,
  ): Promise<ResponseFluxoOcorrenciaRelacaoDto[]> {
    const resultado = await this.fluxoOcorrenciaService.findAllList(query);
    return plainToInstance(ResponseFluxoOcorrenciaRelacaoDto, resultado);
  }

  @Get('unico')
  @Roles(ROLES.ASN1, ROLES.TER1)
  async findOneFirst(
    @Query() query: QueryFluxoOcorrenciaFilterDto,
  ): Promise<ResponseFluxoOcorrenciaRelacaoDto> {
    const registro = await this.fluxoOcorrenciaService.findOneFirst(query);
    return plainToInstance(ResponseFluxoOcorrenciaRelacaoDto, registro);
  }

  @Get(':id')
  @Roles(ROLES.ASN1)
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseFluxoOcorrenciaRelacaoDto> {
    const dado = await this.fluxoOcorrenciaService.findOne(id);
    return plainToInstance(ResponseFluxoOcorrenciaRelacaoDto, dado);
  }

  @Patch(':id')
  @Roles(ROLES.ASN1, ROLES.TER1)
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
