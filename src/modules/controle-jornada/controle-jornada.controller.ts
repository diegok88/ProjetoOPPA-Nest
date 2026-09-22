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
import { ControleJornadaService } from './controle-jornada.service';
import { CreateControleJornadaDto } from './dto/create-controle-jornada.dto';
import { UpdateControleJornadaDto } from './dto/update-controle-jornada.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/auth/guards/roles-auth.guard';
import { ResponseControleJornadaDto } from './dto/response-controle-jornada.dto';
import { plainToInstance } from 'class-transformer';
import { ROLES } from '@/auth/guards/roles.const';
import { Roles } from '@/auth/guards/roles.decorator';
import { QueryControleJornadaFilterDto } from './dto/query-controle-jornada.dto';

@Controller('controle-jornada')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ControleJornadaController {
  constructor(
    private readonly controleJornadaService: ControleJornadaService,
  ) {}

  @Post()
  @Roles(ROLES.ASN1)
  async create(
    @Body() createControleJornadaDto: CreateControleJornadaDto,
  ): Promise<ResponseControleJornadaDto> {
    const dado = await this.controleJornadaService.create(
      createControleJornadaDto,
    );
    return plainToInstance(ResponseControleJornadaDto, dado);
  }

  @Get()
  @Roles(ROLES.ASN1)
  async findAll(
    @Query() query: QueryControleJornadaFilterDto,
  ): Promise<ResponseControleJornadaDto[]> {
    const dados = await this.controleJornadaService.findAll(query);
    return plainToInstance(ResponseControleJornadaDto, dados);
  }

  @Get(':id')
  @Roles(ROLES.ASN1)
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseControleJornadaDto> {
    const dado = await this.controleJornadaService.findOne(id);
    return plainToInstance(ResponseControleJornadaDto, dado);
  }

  @Patch(':id')
  @Roles(ROLES.ASN1)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateControleJornadaDto: UpdateControleJornadaDto,
  ): Promise<ResponseControleJornadaDto> {
    const dado = await this.controleJornadaService.update(
      id,
      updateControleJornadaDto,
    );
    return plainToInstance(ResponseControleJornadaDto, dado);
  }

  @Patch('deactive/:id')
  @Roles(ROLES.ASN1)
  async deactive(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseControleJornadaDto> {
    const dado = await this.controleJornadaService.deactive(id);
    return plainToInstance(ResponseControleJornadaDto, dado);
  }

  @Delete(':id')
  @Roles(ROLES.ASN1)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseControleJornadaDto> {
    const dado = await this.controleJornadaService.remove(id);
    return plainToInstance(ResponseControleJornadaDto, dado);
  }
}
