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
import { AlocacaoService } from './alocacao.service';
import { CreateAlocacaoDto } from './dto/create-alocacao.dto';
import { UpdateAlocacaoDto } from './dto/update-alocacao.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/auth/guards/roles-auth.guard';
import { ResponseAlocacaoDto } from './dto/response-alocacao.dto';
import { plainToInstance } from 'class-transformer';
import { ROLES } from '@/auth/guards/roles.const';
import { Roles } from '@/auth/guards/roles.decorator';
import { QueryAlocacaoFilterDto } from './dto/query-alocacao.dto';

@Controller('alocacao')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AlocacaoController {
  constructor(private readonly alocacaoService: AlocacaoService) {}

  @Post()
  @Roles(ROLES.ASN1)
  async create(
    @Body() createAlocacaoDto: CreateAlocacaoDto,
  ): Promise<ResponseAlocacaoDto> {
    const dado = await this.alocacaoService.create(createAlocacaoDto);
    return plainToInstance(ResponseAlocacaoDto, dado);
  }

  @Get()
  @Roles(ROLES.ASN1)
  async findAll(
    @Query() query: QueryAlocacaoFilterDto,
  ): Promise<ResponseAlocacaoDto[]> {
    const dados = await this.alocacaoService.findAll(query);
    return plainToInstance(ResponseAlocacaoDto, dados);
  }

  @Get(':id')
  @Roles(ROLES.ASN1)
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseAlocacaoDto> {
    const dado = await this.alocacaoService.findOne(id);
    return plainToInstance(ResponseAlocacaoDto, dado);
  }

  @Patch(':id')
  @Roles(ROLES.ASN1)
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
