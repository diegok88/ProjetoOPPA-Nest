import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { SetoresService } from './setores.service';
import { CreateSetoresDto } from './dto/create-setores.dto';
import { UpdateSetoresDto } from './dto/update-setores.dto';
import { ResponseSetoresDto } from './dto/response-setores.dto';
import { plainToInstance } from 'class-transformer';
import { Roles } from '@/auth/guards/roles.decorator';
import { ROLES } from '@/auth/guards/roles.const';
import { QuerySetoresDto } from './dto/query-setores.dto';

@Controller('setores')
export class SetoresController {
  constructor(private readonly setoresService: SetoresService) {}

  @Post()
  @Roles(ROLES.ASN1, ROLES.ADN1)
  async create(
    @Body() createSetoreDto: CreateSetoresDto,
  ): Promise<ResponseSetoresDto> {
    const dado = this.setoresService.create(createSetoreDto);
    return plainToInstance(ResponseSetoresDto, dado);
  }

  @Get()
  @Roles(ROLES.ASN1, ROLES.ADN1)
  async findAll(
    @Query() query: QuerySetoresDto,
  ): Promise<ResponseSetoresDto[]> {
    const dados = await this.setoresService.findAll(query);
    return plainToInstance(ResponseSetoresDto, dados);
  }

  @Get(':id')
  @Roles(ROLES.ASN1, ROLES.ADN1)
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseSetoresDto> {
    const dado = await this.setoresService.findOne(id);
    return plainToInstance(ResponseSetoresDto, dado);
  }

  @Patch(':id')
  @Roles(ROLES.ASN1, ROLES.ADN1)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSetoreDto: UpdateSetoresDto,
  ): Promise<ResponseSetoresDto> {
    const dado = await this.setoresService.update(id, updateSetoreDto);
    return plainToInstance(ResponseSetoresDto, dado);
  }

  @Patch('active/:id')
  @Roles(ROLES.ASN1, ROLES.ADN1)
  async active(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseSetoresDto> {
    const dado = await this.setoresService.active(id);
    return plainToInstance(ResponseSetoresDto, dado);
  }

  @Patch('deactive/:id')
  @Roles(ROLES.ASN1, ROLES.ADN1)
  async deactive(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseSetoresDto> {
    const dado = await this.setoresService.deactive(id);
    return plainToInstance(ResponseSetoresDto, dado);
  }

  @Delete(':id')
  @Roles(ROLES.ASN1, ROLES.ADN1)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseSetoresDto> {
    const dado = await this.setoresService.remove(id);
    return plainToInstance(ResponseSetoresDto, dado);
  }
}
