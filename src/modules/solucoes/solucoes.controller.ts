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
import { SolucoesService } from './solucoes.service';
import { CreateSolucoesDto } from './dto/create-solucoes.dto';
import { UpdateSolucoeDto } from './dto/update-solucoes.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/auth/guards/roles-auth.guard';
import {
  ResponseSolucoesContadorDto,
  ResponseSolucoesDto,
  ResponseSolucoesRelacaoDto,
} from './dto/response-solucoes.dto';
import { plainToInstance } from 'class-transformer';
import { ROLES } from '@/auth/guards/roles.const';
import { Roles } from '@/auth/guards/roles.decorator';
import { QuerySolucoesFilterDto } from './dto/query-solucoes.dto';

@Controller('solucoes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SolucoesController {
  constructor(private readonly solucoesService: SolucoesService) {}

  @Post()
  @Roles(ROLES.ASN1)
  async create(
    @Body() createSolucoesDto: CreateSolucoesDto,
  ): Promise<ResponseSolucoesDto> {
    const dado = await this.solucoesService.create(createSolucoesDto);
    return plainToInstance(ResponseSolucoesDto, dado);
  }

  @Get()
  @Roles(ROLES.ASN1)
  async findAll(
    @Query() query: QuerySolucoesFilterDto,
  ): Promise<ResponseSolucoesRelacaoDto[]> {
    const dados = await this.solucoesService.findAll(query);
    return plainToInstance(ResponseSolucoesRelacaoDto, dados);
  }

  @Get('counter')
  @Roles(ROLES.ASN1, ROLES.ADN1)
  async counter(): Promise<ResponseSolucoesContadorDto> {
    const contador = await this.solucoesService.counter();
    return plainToInstance(ResponseSolucoesContadorDto, contador);
  }

  @Get(':id')
  @Roles(ROLES.ASN1)
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseSolucoesRelacaoDto> {
    const dado = await this.solucoesService.findOne(id);
    return plainToInstance(ResponseSolucoesRelacaoDto, dado);
  }

  @Patch(':id')
  @Roles(ROLES.ASN1)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSolucoeDto: UpdateSolucoeDto,
  ): Promise<ResponseSolucoesDto> {
    const dado = await this.solucoesService.update(id, updateSolucoeDto);
    return plainToInstance(ResponseSolucoesDto, dado);
  }

  @Patch('active/:id')
  @Roles(ROLES.ASN1)
  async active(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseSolucoesDto> {
    const dado = await this.solucoesService.active(id);
    return plainToInstance(ResponseSolucoesDto, dado);
  }

  @Patch('deactive/:id')
  @Roles(ROLES.ASN1)
  async deactive(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseSolucoesDto> {
    const dado = await this.solucoesService.deactive(id);
    return plainToInstance(ResponseSolucoesDto, dado);
  }

  @Delete(':id')
  @Roles(ROLES.ASN1)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseSolucoesDto> {
    const dado = await this.solucoesService.remove(id);
    return plainToInstance(ResponseSolucoesDto, dado);
  }
}
