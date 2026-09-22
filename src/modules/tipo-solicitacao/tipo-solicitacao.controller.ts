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
import { TipoSolicitacaoService } from './tipo-solicitacao.service';
import { CreateTipoSolicitacaoDto } from './dto/create-tipo-solicitacao.dto';
import { UpdateTipoSolicitacaoDto } from './dto/update-tipo-solicitacao.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/auth/guards/roles-auth.guard';
import { ResponseTipoSolicitacaoDto } from './dto/response-tipo-solicitacao.dto';
import { plainToInstance } from 'class-transformer';
import { ROLES } from '@/auth/guards/roles.const';
import { Roles } from '@/auth/guards/roles.decorator';
import { QueryTipoSolicitacaoFilterDto } from './dto/query-tipo-solicitacao.dto';


@Controller('tipo-solicitacao')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TipoSolicitacaoController {
  constructor(private readonly tipoSolicitacaoService: TipoSolicitacaoService) {}

  @Post()
  @Roles(ROLES.ASN1)
  async create(
    @Body() createTipoSolicitacaoDto: CreateTipoSolicitacaoDto,
  ): Promise<ResponseTipoSolicitacaoDto> {
    const dado = await this.tipoSolicitacaoService.create(
      createTipoSolicitacaoDto,
    );
    return plainToInstance(ResponseTipoSolicitacaoDto, dado);
  }

  @Get()
  @Roles(ROLES.ASN1)
  async findAll(
    @Query() query: QueryTipoSolicitacaoFilterDto,
  ): Promise<ResponseTipoSolicitacaoDto[]> {
    const dados = await this.tipoSolicitacaoService.findAll(query);
    return plainToInstance(ResponseTipoSolicitacaoDto, dados);
  }

  @Get(':id')
  @Roles(ROLES.ASN1)
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseTipoSolicitacaoDto> {
    const dado = await this.tipoSolicitacaoService.findOne(id);
    return plainToInstance(ResponseTipoSolicitacaoDto, dado);
  }

  @Patch(':id')
  @Roles(ROLES.ASN1)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTipoSolicitacaoDto: UpdateTipoSolicitacaoDto,
  ): Promise<ResponseTipoSolicitacaoDto> {
    const dado = await this.tipoSolicitacaoService.update(
      id,
      updateTipoSolicitacaoDto,
    );
    return plainToInstance(ResponseTipoSolicitacaoDto, dado);
  }

  @Patch('deactive/:id')
  @Roles(ROLES.ASN1)
  async deactive(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseTipoSolicitacaoDto> {
    const dado = await this.tipoSolicitacaoService.deactive(id);
    return plainToInstance(ResponseTipoSolicitacaoDto, dado);
  }

  @Delete(':id')
  @Roles(ROLES.ASN1)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseTipoSolicitacaoDto> {
    const dado = await this.tipoSolicitacaoService.remove(id);
    return plainToInstance(ResponseTipoSolicitacaoDto, dado);
  }
}