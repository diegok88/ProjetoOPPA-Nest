import { PrismaService } from '@/prisma/prisma.service';
import {
  ExtractDataAuditoria,
  ExtractRegisteredById,
} from '@/utils/extract-data-auditoria.util';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { CreateContadorCrachaDto } from './dto/create-contador-cracha.dto';
import {
  ResponseContadorAdminDto,
  ResponseContadorCrachaDto,
  ResponseContadorEnterpriseDto,
} from './dto/response-contador-cracha.dto';
import { UpdateContadorCrachaDto } from './dto/update-contador-cracha.dto';
import { CreateAuditoriaDto } from '../auditoria/dto/create-auditoria.dto';
import { Acao } from '@/generated/prisma/enums';
import { DeleteContadorCrachaDto } from './dto/delete-contador-cracha.dto';
import { UpdateAuditoriaDto } from '../auditoria/dto/update-auditoria.dto';
import { Prisma } from '@/generated/prisma/client';

@Injectable()
export class ContadorCrachaService {
  private logger = new Logger(ContadorCrachaService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditoria: AuditoriaService,
  ) {}
  // CRIA UM NOVO CONTADOR A CADA CRIAÇÃO DE EMPRESA
  async create(
    createContadorCrachaDto: CreateContadorCrachaDto,
    tx?: Prisma.TransactionClient,
  ): Promise<ResponseContadorCrachaDto> {
    try {
      const executar = async (
        client: Prisma.TransactionClient | PrismaService,
      ) => {
        const { registradoPorId, ...dadosContador } = createContadorCrachaDto;

        const criar = await client.contadorDeCracha.create({
          data: dadosContador,
        });

        const dados = ExtractDataAuditoria(criar);

        const dadosAuditoria: CreateAuditoriaDto = {
          entidade: 'CONTADOR_CRACHA',
          registroId: criar.id,
          acao: Acao.CREATE,
          dadosRegistrados: dados,
          empresaId: createContadorCrachaDto.empresaId,
          registradoPorId: registradoPorId,
        };

        await this.auditoria.create(dadosAuditoria, client);

        return criar;
      };

      let criarContador: any;
      if (tx) {
        criarContador = await executar(tx);
      } else {
        criarContador = await this.prisma.$transaction(async (novaTx) => {
          return executar(novaTx);
        });
      }

      this.logger.log('Contador de crachá criada com sucesso.');
      return plainToClass(ResponseContadorCrachaDto, criarContador);
    } catch (error) {
      this.logger.error('Falha ao cadastrar o contador de crachás.');
      throw error;
    }
  }
  // LISTAGEM DE CONTADORES DE CRACHAS
  async findAll(): Promise<ResponseContadorAdminDto[]> {
    try {
      const listar = await this.prisma.contadorDeCracha.findMany({
        include: {
          empresa: {
            select: { razaoSocial: true },
          },
        },
      });
      this.logger.log('Lista de contadores de crachás gerada com sucesso.');
      return listar.map((item) =>
        plainToClass(ResponseContadorAdminDto, {
          ...item,
          nomeEmpresa: item.empresa?.razaoSocial || '',
        }),
      );
    } catch (error) {
      this.logger.error('Falha ao listar os contadores de crachas');
      throw error;
    }
  }
  // BUSCAR DE CONTADORES DE CRACHAS
  async findOne(id: string): Promise<ResponseContadorAdminDto> {
    try {
      const buscar = await this.prisma.contadorDeCracha.findUnique({
        where: { id: id },
        include: {
          empresa: {
            select: { razaoSocial: true },
          },
        },
      });
      if (!buscar) {
        this.logger.warn(`Contador de crachá id ${id} não encontrado.`);
        throw new NotFoundException();
      }
      return plainToClass(ResponseContadorAdminDto, {
        ...buscar,
        nomeEmpresa: buscar.empresa?.razaoSocial || '',
      });
    } catch (error) {
      this.logger.error('Falha na busca do contador de crachá.');
      throw error;
    }
  }
  // BUSCAR CONTADOR DE CRACHA POR ID EMPRESA
  async findEnterprise(
    id: string,
    tx?: Prisma.TransactionClient,
  ): Promise<ResponseContadorEnterpriseDto> {
    try {
      const client = tx ?? this.prisma;
      const buscar = await client.contadorDeCracha.findFirst({
        where: { empresaId: id },
      });

      return plainToClass(ResponseContadorEnterpriseDto, buscar);
    } catch (error) {
      this.logger.error('Falha na busca do contador de cracha.');
      throw error;
    }
  }
  // ATUALIZA O ATRIBUTO CONTADOR A CADA CADASTRO DE UM NOVO USUARIO DA EMPRESA CADASTRANTE
  async update(
    updateContadorCrachaDto: UpdateContadorCrachaDto,
  ): Promise<ResponseContadorAdminDto> {
    try {
      const atualizarContador = await this.prisma.$transaction(async (tx) => {
        const { empresaId, registradoPorId } = updateContadorCrachaDto;
        const buscar = await this.findEnterprise(empresaId);
        const antes = ExtractDataAuditoria(buscar);
        const atualizar = await this.prisma.contadorDeCracha.update({
          where: { id: buscar.id },
          data: { contador: { increment: 1 } },
        });
        const depois = await ExtractDataAuditoria(atualizar);
        const dadosAuditoria: UpdateAuditoriaDto = {
          entidade: 'CONTADOR_CRACHA',
          registroId: empresaId,
          acao: Acao.UPDATE,
          antes: antes,
          depois: depois,
          empresaId: empresaId,
          registradoPorId: registradoPorId,
        };
        await this.auditoria.update(dadosAuditoria);

        return atualizar;
      });
      return plainToClass(ResponseContadorAdminDto, atualizarContador);
    } catch (error) {
      this.logger.error('Falha ao atualizar o contador de crachá.');
      throw error;
    }
  }
  // INATIVA O CONTADOR DE CRACHAS ATRAVES DA INATIVAÇÃO DA EMPRESA
  async deactive(
    updateContadorCrachaDto: UpdateContadorCrachaDto,
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    try {
      const executar = async (
        client: Prisma.TransactionClient | PrismaService,
      ) => {
        const { empresaId, registradoPorId } = updateContadorCrachaDto;

        const buscar = await this.findEnterprise(empresaId, client);

        const antes = ExtractDataAuditoria(buscar);

        const inativar = await client.contadorDeCracha.update({
          where: { id: buscar.id },
          data: { status: false },
        });

        const depois = ExtractDataAuditoria(inativar);

        const dadosAtualizados: UpdateAuditoriaDto = {
          entidade: 'CONTADOR_CRACHA',
          registroId: empresaId,
          acao: Acao.UPDATE,
          antes: antes,
          depois: depois,
          empresaId: empresaId,
          registradoPorId: registradoPorId,
        };

        await this.auditoria.update(dadosAtualizados, client);

        return inativar;
      };

      let inativarContador: any;
      if (tx) {
        inativarContador = await executar(tx);
      } else {
        inativarContador = await this.prisma.$transaction(async (novaTx) => {
          return executar(novaTx);
        });
      }

      this.logger.log(
        'Atualização do contador de cracha realizado com sucesso.',
      );
    } catch (error) {
      this.logger.error('Falha ao inativar o contador de cracha.');
      throw error;
    }
  }
  // REMOVER DADO DO BANCO PELO ID
  async remove(
    deleteContadorCrachaDto: DeleteContadorCrachaDto,
    tx?: Prisma.TransactionClient,
  ): Promise<ResponseContadorCrachaDto> {
    try {
      const executar = async (
        client: Prisma.TransactionClient | PrismaService,
      ) => {
        const { empresaId, registradoPorId } = deleteContadorCrachaDto;

        const buscar = await this.findEnterprise(empresaId, client);

        const remover = await client.contadorDeCracha.delete({
          where: { id: buscar.id },
        });

        const dados = ExtractDataAuditoria(remover);

        const dadosAuditoria: CreateAuditoriaDto = {
          entidade: 'CONTADOR_CRACHA',
          registroId: buscar.id,
          acao: Acao.DELETE,
          dadosRegistrados: dados,
          empresaId: empresaId,
          registradoPorId: registradoPorId,
        };

        await this.auditoria.create(dadosAuditoria, client);
      };

      let removerContador: any;
      if (tx) {
        removerContador = await executar(tx);
      } else {
        removerContador = await this.prisma.$transaction(async (novatx) => {
          return executar(novatx);
        });
      }

      return plainToClass(ResponseContadorCrachaDto, removerContador);
    } catch (error) {
      this.logger.error('Falha ao remover o contador de crachá.');
      throw error;
    }
  }
}
