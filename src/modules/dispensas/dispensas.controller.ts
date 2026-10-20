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
import { DispensasService } from './dispensas.service';
import { CreateDispensaDto } from './dto/create-dispensa.dto';
import { UpdateDispensaDto } from './dto/update-dispensa.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/auth/guards/roles-auth.guard';

import { plainToInstance } from 'class-transformer';
import { ROLES } from '@/auth/guards/roles.const';
import { Roles } from '@/auth/guards/roles.decorator';
import {
  QueryDispensaCounterDto,
  QueryDispensaDateFilterDto,
  QueryDispensaFilterDto,
} from './dto/query-dispensas.dto';
import {
  ResponseAlertDispensaDto,
  ResponseDispensaContadorDto,
  ResponseDispensaDto,
} from './dto/response-dispensas.dto';

@Controller('dispensas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DispensasController {
  constructor(private readonly dispensasService: DispensasService) {}

  @Post()
  @Roles(ROLES.ASN1, ROLES.ADN1)
  async create(
    @Body() createDispensaDto: CreateDispensaDto,
  ): Promise<ResponseDispensaDto> {
    const dado = await this.dispensasService.create(createDispensaDto);
    return plainToInstance(ResponseDispensaDto, dado);
  }

  @Get()
  @Roles(ROLES.ASN1, ROLES.ADN1)
  async findAll(
    @Query() query: QueryDispensaFilterDto,
  ): Promise<ResponseDispensaDto[]> {
    const dados = await this.dispensasService.findAll(query);
    return plainToInstance(ResponseDispensaDto, dados);
  }

  @Get('check-date')
  @Roles(ROLES.ASN1, ROLES.ADN1)
  async checkAlertManagerDismissal(
    @Query() query: QueryDispensaDateFilterDto,
  ): Promise<ResponseAlertDispensaDto> {
    const dados = await this.dispensasService.checkAlertManagerDismissal(query);
    return plainToInstance(ResponseAlertDispensaDto, dados);
  }

  @Get('counter')
  @Roles(ROLES.ASN1, ROLES.ADN1)
  async counter(
    @Query() query: QueryDispensaCounterDto, 
  ): Promise<ResponseDispensaContadorDto> {
    const contador = await this.dispensasService.counter(query);
    return plainToInstance(ResponseDispensaContadorDto, contador);
  }

  @Get(':id')
  @Roles(ROLES.ASN1, ROLES.ADN1)
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseDispensaDto> {
    const dado = await this.dispensasService.findOne(id);
    return plainToInstance(ResponseDispensaDto, dado);
  }

  @Patch(':id')
  @Roles(ROLES.ASN1, ROLES.ADN1)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDispensaDto: UpdateDispensaDto,
  ): Promise<ResponseDispensaDto> {
    const dado = await this.dispensasService.update(id, updateDispensaDto);
    return plainToInstance(ResponseDispensaDto, dado);
  }

  @Patch('situation/:id')
  @Roles(ROLES.ASN1)
  async updateSituation(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseDispensaDto> {
    const dado = await this.dispensasService.updateSituation(id);
    return plainToInstance(ResponseDispensaDto, dado);
  }

  @Patch('active/:id')
  @Roles(ROLES.ASN1, ROLES.ADN1)
  async active(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseDispensaDto> {
    const dado = await this.dispensasService.active(id);
    return plainToInstance(ResponseDispensaDto, dado);
  }

  @Patch('deactive/:id')
  @Roles(ROLES.ASN1, ROLES.ADN1)
  async deactive(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseDispensaDto> {
    const dado = await this.dispensasService.deactive(id);
    return plainToInstance(ResponseDispensaDto, dado);
  }

  @Delete(':id')
  @Roles(ROLES.ASN1)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseDispensaDto> {
    const dado = await this.dispensasService.remove(id);
    return plainToInstance(ResponseDispensaDto, dado);
  }
}
