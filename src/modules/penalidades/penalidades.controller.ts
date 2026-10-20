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
import { PenalidadesService } from './penalidades.service';
import { CreatePenalidadeDto } from './dto/create-penalidade.dto';
import { UpdatePenalidadeDto } from './dto/update-penalidade.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/auth/guards/roles-auth.guard';
import { plainToInstance } from 'class-transformer';
import { ROLES } from '@/auth/guards/roles.const';
import { Roles } from '@/auth/guards/roles.decorator';
import {
  QueryPenalidadeCounterDto,
  QueryPenalidadeDateFilterDto,
  QueryPenalidadeFilterDto,
} from './dto/query-penalidades.dto';
import {
  ResponseAlertPenalidadeDto,
  ResponsePenalidadeContadorDto,
  ResponsePenalidadeDto,
} from './dto/response-penalidades.dto';

@Controller('penalidades')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PenalidadesController {
  constructor(private readonly penalidadesService: PenalidadesService) {}

  @Post()
  @Roles(ROLES.ASN1, ROLES.ADN1)
  async create(
    @Body() createPenalidadeDto: CreatePenalidadeDto,
  ): Promise<ResponsePenalidadeDto> {
    const dado = await this.penalidadesService.create(createPenalidadeDto);
    return plainToInstance(ResponsePenalidadeDto, dado);
  }

  @Get()
  @Roles(ROLES.ASN1, ROLES.ADN1)
  async findAll(
    @Query() query: QueryPenalidadeFilterDto,
  ): Promise<ResponsePenalidadeDto[]> {
    const dados = await this.penalidadesService.findAll(query);
    return plainToInstance(ResponsePenalidadeDto, dados);
  }

  @Get('check-date')
  @Roles(ROLES.ASN1, ROLES.ADN1)
  async checkAlertManagerDismissal(
    @Query() query: QueryPenalidadeDateFilterDto,
  ): Promise<ResponseAlertPenalidadeDto> {
    const dados =
      await this.penalidadesService.checkAlertManagerPenality(query);
    return plainToInstance(ResponseAlertPenalidadeDto, dados);
  }

  @Get('counter')
  @Roles(ROLES.ASN1, ROLES.ADN1)
  async counter(
    @Query() query: QueryPenalidadeCounterDto,
  ): Promise<ResponsePenalidadeContadorDto> {
    const contador = await this.penalidadesService.counter(query);
    return plainToInstance(ResponsePenalidadeContadorDto, contador);
  }

  @Get(':id')
  @Roles(ROLES.ASN1)
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponsePenalidadeDto> {
    const dado = await this.penalidadesService.findOne(id);
    return plainToInstance(ResponsePenalidadeDto, dado);
  }

  @Patch(':id')
  @Roles(ROLES.ASN1)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePenalidadeDto: UpdatePenalidadeDto,
  ): Promise<ResponsePenalidadeDto> {
    const dado = await this.penalidadesService.update(id, updatePenalidadeDto);
    return plainToInstance(ResponsePenalidadeDto, dado);
  }

  @Patch('situation/:id')
  @Roles(ROLES.ASN1)
  async updateSituation(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponsePenalidadeDto> {
    const dado = await this.penalidadesService.updateSituation(id);
    return plainToInstance(ResponsePenalidadeDto, dado);
  }

  @Patch('active/:id')
  @Roles(ROLES.ASN1)
  async active(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponsePenalidadeDto> {
    const dado = await this.penalidadesService.active(id);
    return plainToInstance(ResponsePenalidadeDto, dado);
  }

  @Patch('deactive/:id')
  @Roles(ROLES.ASN1)
  async deactive(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponsePenalidadeDto> {
    const dado = await this.penalidadesService.deactive(id);
    return plainToInstance(ResponsePenalidadeDto, dado);
  }

  @Delete(':id')
  @Roles(ROLES.ASN1)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponsePenalidadeDto> {
    const dado = await this.penalidadesService.remove(id);
    return plainToInstance(ResponsePenalidadeDto, dado);
  }
}
