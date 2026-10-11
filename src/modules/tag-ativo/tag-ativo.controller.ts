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
import { TagAtivoService } from './tag-ativo.service';
import { CreateTagAtivoDto } from './dto/create-tag-ativo.dto';
import { UpdateTagAtivoDto } from './dto/update-tag-ativo.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/auth/guards/roles-auth.guard';
import {
  ResponseTagAtivoContadorDto,
  ResponseTagAtivoDto,
  ResponseTagAtivoRelacaoDto,
} from './dto/response-tag-ativo.dto';
import { plainToInstance } from 'class-transformer';
import { ROLES } from '@/auth/guards/roles.const';
import { Roles } from '@/auth/guards/roles.decorator';
import { QueryTagAtivoFilterDto } from './dto/query-tag-ativo.dto';
import { TenantContextService } from '@/auth/tenant-context/tenant-context.service';

@Controller('tag-ativo')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TagAtivoController {
  constructor(
    private readonly tagAtivoService: TagAtivoService,
    private readonly tennantContext: TenantContextService,
  ) {}

  @Post()
  @Roles(ROLES.ASN1, ROLES.ADN1)
  async create(
    @Body() createTagAtivoDto: CreateTagAtivoDto,
  ): Promise<ResponseTagAtivoDto> {
    const ctx = this.tennantContext.getStore()!;

    const dado = await this.tagAtivoService.create(
      createTagAtivoDto,
      ctx.empresa,
    );
    return plainToInstance(ResponseTagAtivoDto, dado);
  }

  @Get()
  @Roles(ROLES.ASN1, ROLES.ADN1)
  async findAll(
    @Query() query: QueryTagAtivoFilterDto,
  ): Promise<ResponseTagAtivoDto[]> {
    const dados = await this.tagAtivoService.findAll(query);
    return plainToInstance(ResponseTagAtivoDto, dados);
  }

  @Get('counter')
  @Roles(ROLES.ASN1, ROLES.ADN1)
  async counter(): Promise<ResponseTagAtivoContadorDto> {
    const contador = await this.tagAtivoService.counter();
    return plainToInstance(ResponseTagAtivoContadorDto, contador);
  }

  @Get(':id')
  @Roles(ROLES.ASN1, ROLES.ADN1)
  async findOne( 
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseTagAtivoRelacaoDto> {
    const dado = await this.tagAtivoService.findOne(id);
    return plainToInstance(ResponseTagAtivoRelacaoDto, dado);
  }

  @Patch(':id')
  @Roles(ROLES.ASN1)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTagAtivoDto: UpdateTagAtivoDto,
  ): Promise<ResponseTagAtivoDto> {
    const dado = await this.tagAtivoService.update(id, updateTagAtivoDto);
    return plainToInstance(ResponseTagAtivoDto, dado);
  }

  @Patch('active/:id')
  @Roles(ROLES.ASN1)
  async active(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseTagAtivoDto> {
    const dado = await this.tagAtivoService.active(id);
    return plainToInstance(ResponseTagAtivoDto, dado);
  }

  @Patch('deactive/:id')
  @Roles(ROLES.ASN1)
  async deactive(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseTagAtivoDto> {
    const dado = await this.tagAtivoService.deactive(id);
    return plainToInstance(ResponseTagAtivoDto, dado);
  }

  @Delete(':id')
  @Roles(ROLES.ASN1)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseTagAtivoDto> {
    const dado = await this.tagAtivoService.remove(id);
    return plainToInstance(ResponseTagAtivoDto, dado);
  }
}
