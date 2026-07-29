import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ContadorCrachaService } from './contador-cracha.service';
import { CreateContadorCrachaDto } from './dto/create-contador-cracha.dto';
import {
  ResponseContadorAdminDto,
  ResponseContadorCrachaDto,
  ResponseContadorEnterpriseDto,
} from './dto/response-contador-cracha.dto';
import { UpdateContadorCrachaDto } from './dto/update-contador-cracha.dto';
import { DeleteContadorCrachaDto } from './dto/delete-contador-cracha.dto';
import { QueryContadorCrachaFilterDto } from './dto/query-contador-cracha.dto';
import { plainToClass } from 'class-transformer';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/auth/guards/roles-auth.guard';
import { ROLES } from '@/auth/guards/roles.const';
import { Roles } from '@/auth/guards/roles.decorator';

@Controller('contador-cracha')
export class ContadorCrachaController {
  constructor(private readonly contadorCrachaService: ContadorCrachaService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.ASN1)
  async findAll(
    @Query() query: QueryContadorCrachaFilterDto,
  ): Promise<ResponseContadorCrachaDto[]> {
    const dados = await this.contadorCrachaService.findAll(query);
    return dados.map((lista) => plainToClass(ResponseContadorCrachaDto, lista));
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.ASN1)
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseContadorCrachaDto> {
    const dado = await this.contadorCrachaService.findOne(id);
    return plainToClass(ResponseContadorCrachaDto, dado);
  }

  @Delete()
  async remove(
    @Body() deleteContadorCrachaDto: DeleteContadorCrachaDto,
  ): Promise<ResponseContadorCrachaDto> {
    return this.contadorCrachaService.remove(deleteContadorCrachaDto);
  }
}
