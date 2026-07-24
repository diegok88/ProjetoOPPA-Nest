import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
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

@Controller('contador-cracha')
export class ContadorCrachaController {
  constructor(private readonly contadorCrachaService: ContadorCrachaService) {}

  @Post()
  async create(
    @Body() createContadorCrachaDto: CreateContadorCrachaDto,
  ): Promise<ResponseContadorCrachaDto> {
    return this.contadorCrachaService.create(createContadorCrachaDto);
  }

  @Get()
  async findAll(): Promise<ResponseContadorAdminDto[]> {
    return this.contadorCrachaService.findAll();
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseContadorAdminDto> {
    return this.contadorCrachaService.findOne(id);
  }

  @Get('enterprise/:id')
  async findEnterprise(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseContadorEnterpriseDto> {
    return this.contadorCrachaService.findEnterprise(id);
  }

  @Patch(':id')
  update(@Body() updateContadorCrachaDto: UpdateContadorCrachaDto) {
    return this.contadorCrachaService.update(updateContadorCrachaDto);
  }

  @Delete()
  async remove(
    @Body() deleteContadorCrachaDto: DeleteContadorCrachaDto,
  ): Promise<ResponseContadorCrachaDto> {
    return this.contadorCrachaService.remove(deleteContadorCrachaDto);
  }
}
