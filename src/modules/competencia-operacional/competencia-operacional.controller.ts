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
import { CompetenciaOperacionalService } from './competencia-operacional.service';
import { CreateCompetenciaOperacionalDto } from './dto/create-competencia-operacional.dto';
import { UpdateCompetenciaOperacionalDto } from './dto/update-competencia-operacional.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/auth/guards/roles-auth.guard';
import {
  ResponseCompetenciaOperacionalAssetsDto,
  ResponseCompetenciaOperacionalContadorDto,
  ResponseCompetenciaOperacionalDto,
} from './dto/response-competencia-operacional.dto';
import { plainToInstance } from 'class-transformer';
import { ROLES } from '@/auth/guards/roles.const';
import { Roles } from '@/auth/guards/roles.decorator';
import {
  QueryCompetenciaOperacionalCounterDto,
  QueryCompetenciaOperacionalFilterDto,
  QueryCompetenciaOperacionalOperadorDto,
} from './dto/query-competencia-operacional.dto';

@Controller('competencia-operacional')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CompetenciaOperacionalController {
  constructor(
    private readonly competenciaOperacionalService: CompetenciaOperacionalService,
  ) {}

  @Post()
  @Roles(ROLES.ASN1, ROLES.ADN1)
  async create(
    @Body() createCompetenciaOperacionalDto: CreateCompetenciaOperacionalDto,
  ): Promise<ResponseCompetenciaOperacionalDto> {
    const dado = await this.competenciaOperacionalService.create(
      createCompetenciaOperacionalDto,
    );
    return plainToInstance(ResponseCompetenciaOperacionalDto, dado);
  }

  @Get()
  @Roles(ROLES.ASN1, ROLES.ADN1)
  async findAll(
    @Query() query: QueryCompetenciaOperacionalFilterDto,
  ): Promise<ResponseCompetenciaOperacionalDto[]> {
    const dados = await this.competenciaOperacionalService.findAll(query);
    return plainToInstance(ResponseCompetenciaOperacionalDto, dados);
  }

  @Get('assets')
  @Roles(ROLES.ASN1, ROLES.ADN1)
  async findAssetsAvailable(
    @Query() query: QueryCompetenciaOperacionalOperadorDto,
  ): Promise<ResponseCompetenciaOperacionalAssetsDto[]> {
    const dados =
      await this.competenciaOperacionalService.findAssetsAvailable(query);
    return plainToInstance(ResponseCompetenciaOperacionalAssetsDto, dados);
  }

  @Get('counter')
  @Roles(ROLES.ASN1, ROLES.ADN1)
  async counter(
    @Query() query: QueryCompetenciaOperacionalCounterDto,
  ): Promise<ResponseCompetenciaOperacionalContadorDto> {
    const contador = await this.competenciaOperacionalService.counter(query);
    return plainToInstance(ResponseCompetenciaOperacionalContadorDto, contador);
  }

  @Get(':id')
  @Roles(ROLES.ASN1)
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseCompetenciaOperacionalDto> {
    const dado = await this.competenciaOperacionalService.findOne(id);
    return plainToInstance(ResponseCompetenciaOperacionalDto, dado);
  }

  @Patch(':id')
  @Roles(ROLES.ASN1)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCompetenciaOperacionalDto: UpdateCompetenciaOperacionalDto,
  ): Promise<ResponseCompetenciaOperacionalDto> {
    const dado = await this.competenciaOperacionalService.update(
      id,
      updateCompetenciaOperacionalDto,
    );
    return plainToInstance(ResponseCompetenciaOperacionalDto, dado);
  }

  @Patch('deactive/:id')
  @Roles(ROLES.ASN1)
  async deactive(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseCompetenciaOperacionalDto> {
    const dado = await this.competenciaOperacionalService.deactive(id);
    return plainToInstance(ResponseCompetenciaOperacionalDto, dado);
  }

  @Delete(':id')
  @Roles(ROLES.ASN1)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseCompetenciaOperacionalDto> {
    const dado = await this.competenciaOperacionalService.remove(id);
    return plainToInstance(ResponseCompetenciaOperacionalDto, dado);
  }
}
