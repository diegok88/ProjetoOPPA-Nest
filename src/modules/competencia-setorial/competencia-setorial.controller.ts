import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseUUIDPipe,
  Patch,
} from '@nestjs/common';
import { CompetenciaSetorialService } from './competencia-setorial.service';
import { CreateCompetenciaSetorialDto } from './dto/create-competencia-setorial.dto';
import {
  ResponseCompetenciaRelacaoDto,
  ResponseCompetenciaSetorialContadorDto,
  ResponseCompetenciaSetorialDto,
  ResponseCompSetSectionSelectDto,
} from './dto/response-competencia-setorial.dto';
import { plainToInstance } from 'class-transformer';
import { QueryCompetenciaSetorialFilterDto } from './dto/query-competencia-setorial.dto';
import { Roles } from '@/auth/guards/roles.decorator';
import { ROLES } from '@/auth/guards/roles.const';
import { TenantContextService } from '@/auth/tenant-context/tenant-context.service';

@Controller('competencia-setorial')
export class CompetenciaSetorialController {
  constructor(
    private readonly competenciaSetorialService: CompetenciaSetorialService,
    private readonly tennantContext: TenantContextService,
  ) {}

  @Post()
  @Roles(ROLES.ASN1, ROLES.ADN1)
  async create(
    @Body() create: CreateCompetenciaSetorialDto,
  ): Promise<ResponseCompetenciaSetorialDto> {
    const dado = this.competenciaSetorialService.create(create);
    return plainToInstance(ResponseCompetenciaSetorialDto, dado);
  }

  @Get()
  @Roles(ROLES.ASN1, ROLES.ADN1)
  async findAll(): Promise<ResponseCompetenciaSetorialDto[]> {
    const query: QueryCompetenciaSetorialFilterDto = {};
    const dados = await this.competenciaSetorialService.findAll(query);
    return plainToInstance(ResponseCompetenciaSetorialDto, dados);
  }

  @Get('list/:id')
  @Roles(ROLES.ASN1, ROLES.ADN1)
  async findAllList(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseCompetenciaRelacaoDto[]> {
    const ctx = this.tennantContext.getStore()!;

    const query: QueryCompetenciaSetorialFilterDto = {
      colaboradorId: id,
      gestorId: ctx.user,
      status: true,
      incluir: 'setores_parcial',
    };
    const dados = await this.competenciaSetorialService.findAll(query);
    return plainToInstance(ResponseCompetenciaRelacaoDto, dados);
  }

  @Get('section_available/:id')
  @Roles(ROLES.ASN1, ROLES.ADN1)
  async findSectionAvailable(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseCompSetSectionSelectDto[]> {
    const dados =
      await this.competenciaSetorialService.findSectionAvailable(id);
    return plainToInstance(ResponseCompSetSectionSelectDto, dados);
  }

  @Get('counter')
  @Roles(ROLES.ASN1, ROLES.ADN1)
  async counter(): Promise<ResponseCompetenciaSetorialContadorDto> {
    const contador = await this.competenciaSetorialService.counter();
    return plainToInstance(ResponseCompetenciaSetorialContadorDto, contador);
  }

  @Get(':id')
  @Roles(ROLES.ASN1, ROLES.ADN1)
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseCompetenciaSetorialDto> {
    const dado = await this.competenciaSetorialService.findOne(id);
    return plainToInstance(ResponseCompetenciaSetorialDto, dado);
  }

  @Patch('deactive/:id')
  @Roles(ROLES.ASN1, ROLES.ADN1)
  async deactive(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseCompetenciaSetorialDto> {
    const dado = await this.competenciaSetorialService.deactive(id);
    return plainToInstance(ResponseCompetenciaSetorialDto, dado);
  }

  @Delete(':id')
  @Roles(ROLES.ASN1, ROLES.ADN1)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.competenciaSetorialService.remove(id);
  }
}
