import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { AlocacaoService } from './alocacao.service';
import { UpdateAlocacaoDto } from './dto/update-alocacao.dto';
import {
  ResponseAlertAlocacaoDto,
  ResponseAlocacaoContadorDto,
  ResponseAlocacaoDto,
  ResponseAlocacaoPaginadaDto,
  ResponseAlocacaoRelacaoDto,
} from './dto/response-alocacao.dto';
import { plainToInstance } from 'class-transformer';
import { ROLES } from '@/auth/guards/roles.const';
import { Roles } from '@/auth/guards/roles.decorator';
import {
  QueryAlocacaoOperacionalCounterDto,
  QueryAlocacaoOperacionalFilterDto,
  QueryAlocacaoOperacionalSolicitacaoDto,
  QueryQuantidadeAlocacaoOperadorDto,
} from './dto/query-alocacao.dto';
import { HttpJwtGuard } from '@/auth/guards/http-jwt.guard';
import { HttpRolesGuard } from '@/auth/guards/http-roles.guard';

@Controller('alocacao')
@UseGuards(HttpJwtGuard, HttpRolesGuard)
export class AlocacaoController {
  constructor(private readonly alocacaoService: AlocacaoService) {}

  @Get('solicitacao')
  @Roles(ROLES.ASN1, ROLES.SUP1)
  async findOperatorRequest(
    @Query() query: QueryAlocacaoOperacionalSolicitacaoDto,
  ): Promise<ResponseAlocacaoDto> {
    const resultado = await this.alocacaoService.findOperatorRequest(query);
    return plainToInstance(ResponseAlocacaoDto, resultado);
  }

  @Get()
  @Roles(ROLES.ASN1, ROLES.SUP1)
  async findAll(
    @Query() query: QueryAlocacaoOperacionalFilterDto,
  ): Promise<ResponseAlocacaoPaginadaDto> {
    const resultado = await this.alocacaoService.findAll(query);
    return plainToInstance(ResponseAlocacaoPaginadaDto, resultado);
  }

  @Get('allocation')
  @Roles(ROLES.ASN1, ROLES.SUP1, ROLES.TER1)
  async findOneAllocation(
    @Query() query: QueryAlocacaoOperacionalFilterDto,
  ): Promise<ResponseAlocacaoRelacaoDto> {
    const resultado = await this.alocacaoService.findOneAllocation(query);
    return plainToInstance(ResponseAlocacaoRelacaoDto, resultado);
  }

  @Get('check-allocation')
  @Roles(ROLES.ASN1, ROLES.SUP1)
  async checkManagerAllocation(
    @Query() query: QueryQuantidadeAlocacaoOperadorDto,
  ): Promise<ResponseAlertAlocacaoDto> {
    const dados = await this.alocacaoService.checkManagerAllocation(query);
    return plainToInstance(ResponseAlertAlocacaoDto, dados);
  }

  @Get('counter')
  @Roles(ROLES.ASN1, ROLES.SUP1)
  async counter(
    @Query() query: QueryAlocacaoOperacionalCounterDto,
  ): Promise<ResponseAlocacaoContadorDto> {
    const contador = await this.alocacaoService.counter(query);
    return plainToInstance(ResponseAlocacaoContadorDto, contador);
  }

  @Get(':id')
  @Roles(ROLES.ASN1, ROLES.SUP1)
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseAlocacaoRelacaoDto> {
    const dado = await this.alocacaoService.findOne(id);
    return plainToInstance(ResponseAlocacaoRelacaoDto, dado);
  }

  @Patch(':id')
  @Roles(ROLES.ASN1, ROLES.SUP1)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateAlocacaoDto: UpdateAlocacaoDto,
  ): Promise<ResponseAlocacaoDto> {
    const dado = await this.alocacaoService.update(id, updateAlocacaoDto);
    return plainToInstance(ResponseAlocacaoDto, dado);
  }

  @Patch('deactive/:id')
  @Roles(ROLES.ASN1)
  async deactive(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseAlocacaoDto> {
    const dado = await this.alocacaoService.deactive(id);
    return plainToInstance(ResponseAlocacaoDto, dado);
  }

  @Delete(':id')
  @Roles(ROLES.ASN1)
  async remove(@Param('id') id: string): Promise<ResponseAlocacaoDto> {
    const dado = await this.alocacaoService.remove(id);
    return plainToInstance(ResponseAlocacaoDto, dado);
  }
}
