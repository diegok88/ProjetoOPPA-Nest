import { PrismaService } from '@/prisma/prisma.service';
import {
  ExtractDataAuditoria,
  ExtractRegisteredById,
} from '@/utils/extract-data-auditoria.util';
import { StructureDataAuditoriaCreate } from '@/utils/structure-data-auditoria.util';
import { Injectable, Logger } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { ContadorCrachaService } from '../contador-cracha/contador-cracha.service';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { ResponseEmpresaDto } from './dto/response-empresa.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';

@Injectable()
export class EmpresaService {
  private logger = new Logger(EmpresaService.name);

  constructor(
    private readonly prisma: PrismaService,
    private auditoria: AuditoriaService,
    private contadorCracha: ContadorCrachaService,
  ) {}

  // SERVIÇO CRIAR EMPRESA
  async create(
    createEmpresaDto: CreateEmpresaDto,
  ): Promise<ResponseEmpresaDto> {
    try {
      const criarEmpresa = await this.prisma.$transaction(async (tx) => {
        const dadosSemRegistradoPorId =
          await ExtractRegisteredById(createEmpresaDto);
        const criar = await this.prisma.empresa.create({
          data: dadosSemRegistradoPorId,
        });
        const dadosSemId = await ExtractDataAuditoria(criar);
        const dadosCriarContador = {
          empresaId: criar.id,
          contador: 0,
          registradoPorId: createEmpresaDto.registradoPorId,
        };
        await this.contadorCracha.createAccountant(dadosCriarContador);
        const dadosAuditoria = await StructureDataAuditoriaCreate(
          'EMPRESA',
          criar.id,
          dadosSemId,
          createEmpresaDto.registradoPorId,
        );
        await this.auditoria.create(dadosAuditoria);
        return criar;
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
      if (!buscarEmpresa) {
        this.logger.warn(`Empresa id ${id} não encontrada.`);
      } else {
        this.logger.log(`Empresa id ${id} gerada com sucesso.`);
      }
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
  // INATIVAR EMPRESA PELO ID
  async deactive(id: string): Promise<ResponseEmpresaDto> {
    try {
      const inativarEmpresa = await this.prisma.empresa.update({
        where: { id: id },
        data: { status: false },
      });
      this.logger.log(
        `Inativação da empresa id ${inativarEmpresa.id} realizada com sucesso.`,
      );
      return plainToClass(ResponseEmpresaDto, inativarEmpresa);
    } catch (error) {
      this.logger.error(`Falha ao inativar a empresa.`);
      throw error;
    }
  }
  // DELETAR EMPRESA PELO ID
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
