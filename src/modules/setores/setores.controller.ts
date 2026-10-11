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
import {
  ResponseSetoresContadorDto,
  ResponseSetoresDto,
  ResponseSetoresListDto,
} from './dto/response-setores.dto';
import { plainToInstance } from 'class-transformer';
import { Roles } from '@/auth/guards/roles.decorator';
import { ROLES } from '@/auth/guards/roles.const';
import { QuerySetoresDto } from './dto/query-setores.dto';
import { TenantContextService } from '@/auth/tenant-context/tenant-context.service';
import { PerfilService } from '../perfil/perfil.service';

@Controller('setores')
export class SetoresController {
  constructor(
    private readonly setoresService: SetoresService,
    private readonly perfilService: PerfilService,
    private readonly tennantContext: TenantContextService,
  ) {}

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

  @Get('list')
  @Roles(ROLES.ASN1, ROLES.ADN1)
  async findAllList(): Promise<ResponseSetoresListDto[]> {
    const query: QuerySetoresDto = { campos: 'id,codigo,descricao' };
    const ctx = this.tennantContext.getStore()!;
    const perfil = await this.perfilService.findOne(ctx.perfil);
    const desPerfil = `${perfil.descricao} - ${perfil.nivel}`;
    if (desPerfil !== ROLES.ASN1) {
      query.empresaId = ctx.empresa;
    }

    const dados = await this.setoresService.findAll(query);
    return plainToInstance(ResponseSetoresListDto, dados);
  }

  // CONTADOR DE REGISTROS TOTAIS, ATIVOS E INATIVOS
  @Get('counter')
  @Roles(ROLES.ASN1)
  async counter(): Promise<ResponseSetoresContadorDto> {
    const contador = await this.setoresService.counter();
    return plainToInstance(ResponseSetoresContadorDto, contador);
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
