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
import { QueryDispensaFilterDto } from './dto/query-dispensas.dto';
import { ResponseDispensaDto } from './dto/response-dispensas.dto';

@Controller('dispensas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DispensasController {
  constructor(private readonly dispensasService: DispensasService) {}

  @Post()
  @Roles(ROLES.ASN1)
  async create(
    @Body() createDispensaDto: CreateDispensaDto,
  ): Promise<ResponseDispensaDto> {
    const dado = await this.dispensasService.create(createDispensaDto);
    return plainToInstance(ResponseDispensaDto, dado);
  }

  @Get()
  @Roles(ROLES.ASN1)
  async findAll(
    @Query() query: QueryDispensaFilterDto,
  ): Promise<ResponseDispensaDto[]> {
    const dados = await this.dispensasService.findAll(query);
    return plainToInstance(ResponseDispensaDto, dados);
  }

  @Get(':id')
  @Roles(ROLES.ASN1)
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseDispensaDto> {
    const dado = await this.dispensasService.findOne(id);
    return plainToInstance(ResponseDispensaDto, dado);
  }

  @Patch(':id')
  @Roles(ROLES.ASN1)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDispensaDto: UpdateDispensaDto,
  ): Promise<ResponseDispensaDto> {
    const dado = await this.dispensasService.update(id, updateDispensaDto);
    return plainToInstance(ResponseDispensaDto, dado);
  }

  @Patch('deactive/:id')
  @Roles(ROLES.ASN1)
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
