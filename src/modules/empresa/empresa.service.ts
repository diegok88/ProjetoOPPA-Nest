import { PrismaService } from '@/prisma/prisma.service';
import {
  ExtractDataAuditoria,
  ExtractRegisteredById,
} from '@/utils/extract-data-auditoria.util';
import {
  StructureDataAuditoriaCreate,
  StructureDataAuditoriaUpdate,
} from '@/utils/structure-data-auditoria.util';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { ContadorCrachaService } from '../contador-cracha/contador-cracha.service';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { ResponseEmpresaDto } from './dto/response-empresa.dto';
import {
  UpdateEmpresaDeactiveDto,
  UpdateEmpresaDto,
} from './dto/update-empresa.dto';
import { UsuarioService } from '../usuario/usuario.service';
import { UpdateContadorCrachaDto } from '../contador-cracha/dto/update-contador-cracha.dto';
import { UpdateUsuarioDeactiveDto } from '../usuario/dto/update-usuario.dto';

@Injectable()
export class EmpresaService {
  private logger = new Logger(EmpresaService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditoria: AuditoriaService,
    private readonly usuario: UsuarioService,
    private readonly contadorCracha: ContadorCrachaService,
  ) {}

  // SERVIÇO CRIAR EMPRESA
  async createEnterprise(
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
  async findAllEnterprise(): Promise<ResponseEmpresaDto[]> {
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
  async findOneEnterprise(id: string): Promise<ResponseEmpresaDto> {
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
  async updateEnterprise(
    id: string,
    updateEmpresaDto: UpdateEmpresaDto,
  ): Promise<ResponseEmpresaDto> {
    try {
      const atualizarEmpresa = await this.prisma.$transaction(async (tx) => {
        const buscarUsuario = await this.usuario.findOne(
          updateEmpresaDto.registradoPorId,
        );
        if (id !== buscarUsuario.empresaId) {
          this.logger.warn(
            `Usuario id ${buscarUsuario.id} não pertence a está empresa.`,
          );
          throw new UnauthorizedException(
            `Usuario id ${buscarUsuario.id} não pertence a está empresa.`,
          );
        }

        const buscarEmpresa = await this.findOneEnterprise(id);
        const antesSemId = await ExtractDataAuditoria(buscarEmpresa);

        const dadosAtualizados = await ExtractRegisteredById(updateEmpresaDto);
        const atualizarEmpresa = await tx.empresa.update({
          where: { id: id },
          data: dadosAtualizados,
        });
        const depoisSemId = await ExtractDataAuditoria(atualizarEmpresa);

        const dadosAuditoria = await StructureDataAuditoriaUpdate(
          'EMPRESA',
          id,
          antesSemId,
          depoisSemId,
          updateEmpresaDto.registradoPorId,
        );

        await this.auditoria.update(dadosAuditoria);

        return atualizarEmpresa;
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
  async deactiveEnterprise(
    id: string,
    updateEmpresaDeactiveDto: UpdateEmpresaDeactiveDto,
  ): Promise<ResponseEmpresaDto> {
    try {
      const inativarEmpresa = await this.prisma.$transaction(async (tx) => {
        const buscarEmpresa = await this.findOneEnterprise(id);
        const antesSemId = await ExtractDataAuditoria(buscarEmpresa);

        const inativarEmpresa = await this.prisma.empresa.update({
          where: { id: id },
          data: { status: false },
        });
        const depoisSemId = await ExtractDataAuditoria(inativarEmpresa);

        const dadosAtualizados = await StructureDataAuditoriaUpdate(
          'EMPRESA',
          id,
          antesSemId,
          depoisSemId,
          updateEmpresaDeactiveDto.registradoPorId,
        );
        const inativarContador: UpdateContadorCrachaDto = {
          empresaId: id,
          registradoPorId: updateEmpresaDeactiveDto.registradoPorId,
        };
        await this.contadorCracha.deactiveAccountant(inativarContador);
        const inativarUsuario: UpdateUsuarioDeactiveDto = {
          empresaId: id,
          registradoPorId: updateEmpresaDeactiveDto.registradoPorId,
        };
        await this.usuario.deactiveAll(inativarUsuario);
        await this.auditoria.update(dadosAtualizados);

        return inativarEmpresa;
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
  async removeEnterprise(id: string): Promise<ResponseEmpresaDto> {
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
