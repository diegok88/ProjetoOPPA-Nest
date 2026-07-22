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

@Controller('contador-cracha')
export class ContadorCrachaController {
  constructor(private readonly contadorCrachaService: ContadorCrachaService) {}

  @Post()
  async createAccountant(
    @Body() createContadorCrachaDto: CreateContadorCrachaDto,
  ): Promise<ResponseContadorCrachaDto> {
    return this.contadorCrachaService.createAccountant(createContadorCrachaDto);
  }

  @Get()
  async findAllAccountant(): Promise<ResponseContadorAdminDto[]> {
    return this.contadorCrachaService.findAllAccountant();
  }

  @Get(':id')
  async findOneAccountant(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseContadorAdminDto> {
    return this.contadorCrachaService.findOneAccountant(id);
  }

  @Get('enterprise/:id')
  async findEnterpriseAccountant(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseContadorEnterpriseDto> {
    return this.contadorCrachaService.findEnterpriseAccountant(id);
  }

  @Patch('update-accountant/:id')
  updateAccountant(@Body() updateContadorCrachaDto: UpdateContadorCrachaDto) {
    return this.contadorCrachaService.updateAccountant(updateContadorCrachaDto);
  }

  @Delete(':id')
  async removeAccountant(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() registradoPorId: string,
  ): Promise<ResponseContadorCrachaDto> {
    return this.contadorCrachaService.removeAccountant(id, registradoPorId);
  }
}
