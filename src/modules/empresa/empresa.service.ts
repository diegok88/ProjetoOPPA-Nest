import { PrismaService } from '@/prisma/prisma.service';
import {
  ExtractDataAuditoria,
  ExtractRegisteredById,
} from '@/utils/extract-data-auditoria.util';
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
import { DeleteEmpresaDto } from './dto/delete-empresa';
import { CreateAuditoriaDto } from '../auditoria/dto/create-auditoria.dto';
import { Acao } from '@/generated/prisma/enums';
import { DeleteContadorCrachaDto } from '../contador-cracha/dto/delete-contador-cracha.dto';
import { DeleteUsuarioDto } from '../usuario/dto/delete-usuario.dto';
import { UpdateAuditoriaDto } from '../auditoria/dto/update-auditoria.dto';
import { Prisma } from '@/generated/prisma/client';

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
  async create(
    createEmpresaDto: CreateEmpresaDto,
  ): Promise<ResponseEmpresaDto> {
    try {
      const criarEmpresa = await this.prisma.$transaction(async (tx) => {
        const { registradoPorId, ...dadosEmpresa } = createEmpresaDto;

        const criar = await tx.empresa.create({
          data: dadosEmpresa,
        });

        const dados = ExtractDataAuditoria(criar);

        const dadosCriarContador = {
          empresaId: criar.id,
          contador: 0,
          registradoPorId: createEmpresaDto.registradoPorId,
        };

        await this.contadorCracha.create(dadosCriarContador, tx);

        const dadosAuditoria: CreateAuditoriaDto = {
          entidade: 'EMPRESA',
          registroId: criar.id,
          acao: Acao.CREATE,
          dadosRegistrados: dados,
          empresaId: criar.id,
          registradoPorId: registradoPorId,
        };

        await this.auditoria.create(dadosAuditoria, tx);

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
  async findOne(
    id: string,
    tx?: Prisma.TransactionClient,
  ): Promise<ResponseEmpresaDto> {
    try {
      const client = tx ?? this.prisma;
      const buscarEmpresa = await client.empresa.findUnique({
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
      const atualizarEmpresa = await this.prisma.$transaction(async (tx) => {
        const { registradoPorId, ...dadosEmpresa } = updateEmpresaDto;

        const buscarUsuario = await this.usuario.findOne(registradoPorId, tx);
        if (id !== buscarUsuario.empresaId) {
          this.logger.warn(
            `Usuario id ${buscarUsuario.id} não pertence a está empresa.`,
          );
          throw new UnauthorizedException(
            `Usuario id ${buscarUsuario.id} não pertence a está empresa.`,
          );
        }

        const buscarEmpresa = await this.findOne(id, tx);
        const antes = await ExtractDataAuditoria(buscarEmpresa);

        const atualizarEmpresa = await tx.empresa.update({
          where: { id: id },
          data: dadosEmpresa,
        });
        const depois = ExtractDataAuditoria(atualizarEmpresa);

        const dadosAuditoria: UpdateAuditoriaDto = {
          entidade: 'EMPRESA',
          registroId: id,
          acao: Acao.UPDATE,
          antes: antes,
          depois: depois,
          empresaId: id,
          registradoPorId: registradoPorId,
        };

        await this.auditoria.update(dadosAuditoria, tx);

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
  async deactive(
    id: string,
    updateEmpresaDeactiveDto: UpdateEmpresaDeactiveDto,
  ): Promise<ResponseEmpresaDto> {
    try {
      const inativarEmpresa = await this.prisma.$transaction(async (tx) => {
        const { registradoPorId } = updateEmpresaDeactiveDto;

        const buscarEmpresa = await this.findOne(id, tx);

        const antes = ExtractDataAuditoria(buscarEmpresa);

        const inativarEmpresa = await tx.empresa.update({
          where: { id: id },
          data: { status: false },
        });

        const depois = ExtractDataAuditoria(inativarEmpresa);

        const dadosAtualizados: UpdateAuditoriaDto = {
          entidade: 'EMPRESA',
          registroId: id,
          acao: Acao.DEACTIVATE,
          antes: antes,
          depois: depois,
          empresaId: id,
          registradoPorId: registradoPorId,
        };

        const inativarContador: UpdateContadorCrachaDto = {
          empresaId: id,
          registradoPorId: updateEmpresaDeactiveDto.registradoPorId,
        };

        await this.contadorCracha.deactive(inativarContador, tx);

        const inativarUsuario: UpdateUsuarioDeactiveDto = {
          empresaId: id,
          registradoPorId: updateEmpresaDeactiveDto.registradoPorId,
        };
        await this.usuario.deactiveAll(inativarUsuario, tx);

        await this.auditoria.update(dadosAtualizados, tx);

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
  async remove(
    id: string,
    deleteEmpresaDto: DeleteEmpresaDto,
  ): Promise<ResponseEmpresaDto> {
    try {
      const deletarEmpresa = this.prisma.$transaction(async (tx) => {
        const { registradoPorId, empresaId } = deleteEmpresaDto;

        const contadorCracha: DeleteContadorCrachaDto = {
          empresaId: empresaId,
          registradoPorId: registradoPorId,
        };
        await this.contadorCracha.remove(contadorCracha, tx);

        const usuario: DeleteUsuarioDto = {
          empresaId: empresaId,
          registradoPorId: registradoPorId,
        };
        await this.usuario.removeAll(usuario);

        const buscar = await this.findOne(id, tx);
        const dados = ExtractDataAuditoria(buscar);

        const deletar = await tx.empresa.delete({
          where: { id: id },
        });

        const dadosAuditoria: CreateAuditoriaDto = {
          entidade: 'EMPRESA',
          registroId: 'id',
          acao: Acao.DELETE,
          dadosRegistrados: dados,
          empresaId: empresaId,
          registradoPorId: registradoPorId,
        };
        await this.auditoria.create(dadosAuditoria, tx);

        return deletar;
      });
      this.logger.log(`Delete da empresa id ${id} realizada com sucesso.`);
      return plainToClass(ResponseEmpresaDto, deletarEmpresa);
    } catch (error) {
      this.logger.error(`Falha ao deletar a empresa.`);
      throw error;
    }
  }
}
