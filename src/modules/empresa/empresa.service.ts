import { PrismaService } from '@/prisma/prisma.service';
import { Injectable, Logger } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { ResponseEmpresaDto } from './dto/response-empresa.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';

@Injectable()
export class EmpresaService {
  private logger = new Logger(EmpresaService.name);

  constructor(private readonly prisma: PrismaService) {}

  // SERVIÇO CRIAR EMPRESA
  async create(
    createEmpresaDto: CreateEmpresaDto,
  ): Promise<ResponseEmpresaDto> {
    try {
      const criarEmpresa = await this.prisma.empresa.create({
        data: createEmpresaDto,
      });
      this.logger.log(`Empresa com id ${criarEmpresa.id} criado com sucesso.`);
      return plainToClass(ResponseEmpresaDto, criarEmpresa);
    } catch (error) {
      this.logger.error(`Falha na criação da empresa.`);
      throw error;
    }
  }
  // SERVIÇO LISTAR EMPRESAS
  async findAll(): Promise<ResponseEmpresaDto[]> {
    try {
      const listarEmpresas = await this.prisma.empresa.findMany();
      this.logger.log(`Lista de empresas geradas com sucesso.`);
      return listarEmpresas.map((lista) =>
        plainToClass(ResponseEmpresaDto, lista),
      );
    } catch (error) {
      this.logger.error(`Falha ao listar as empresas.`);
      throw error;
    }
  }
  // SERVIÇO DE BUSCA DE EMPRESA POR ID
  async findOne(id: string): Promise<ResponseEmpresaDto> {
    try {
      const buscarEmpresa = await this.prisma.empresa.findUnique({
        where: { id: id },
      });
      this.logger.log(`Busca da empresa gerada com sucesso.`);
      return plainToClass(ResponseEmpresaDto, buscarEmpresa);
    } catch (error) {
      this.logger.error(`Falha ao buscar a empresa.`);
      throw error;
    }
  }
  // SERVIÇO DE ATUALIZAÇÃO PELO ID
  async update(
    id: string,
    updateEmpresaDto: UpdateEmpresaDto,
  ): Promise<ResponseEmpresaDto> {
    try {
      const atualizarEmpresa = await this.prisma.empresa.update({
        where: { id: id },
        data: updateEmpresaDto,
      });
      this.logger.log(
        `Atualização da empresa id ${atualizarEmpresa.id} realizada com sucesso.`,
      );
      return plainToClass(ResponseEmpresaDto, atualizarEmpresa);
    } catch (error) {
      this.logger.error(`Falha ao atualizar a empresa.`);
      throw error;
    }
  }

  async remove(id: string): Promise<ResponseEmpresaDto> {
    try {
      const deletarEmpresa = await this.prisma.empresa.delete({
        where: { id: id },
      });
      this.logger.log(
        `Delete da empresa id ${deletarEmpresa.id} realizada com sucesso.`,
      );
      return plainToClass(ResponseEmpresaDto, deletarEmpresa);
    } catch (error) {
      this.logger.error(`Falha ao deletar a empresa.`);
      throw error;
    }
  }
}
