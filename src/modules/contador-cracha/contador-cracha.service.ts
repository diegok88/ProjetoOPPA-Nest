import { PrismaService } from '@/prisma/prisma.service';
import {
  ExtractDataAuditoria,
  ExtractRegisteredById,
} from '@/utils/extract-data-auditoria.util';
import {
  StructureDataAuditoriaCreate,
  StructureDataAuditoriaUpdate,
} from '@/utils/structure-data-auditoria.util';
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

@Injectable()
export class ContadorCrachaService {
  private logger = new Logger(ContadorCrachaService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditoria: AuditoriaService,
  ) {}
  // CRIA UM NOVO CONTADOR A CADA CRIAÇÃO DE EMPRESA
  async createAccountant(
    createContadorCrachaDto: CreateContadorCrachaDto,
  ): Promise<ResponseContadorCrachaDto> {
    try {
      // transação de criação e auditoria
      const criarContador = await this.prisma.$transaction(async (tx) => {
        // Função de eliminação do atributo registradoPOrId
        const dadosSemRegistrado = await ExtractRegisteredById(
          createContadorCrachaDto,
        );
        // Cria o contador de cracha
        const criar = await tx.contadorDeCracha.create({
          data: dadosSemRegistrado,
        });
        // Retira o id dos dados criados
        const dadosSemId = await ExtractDataAuditoria(criar);
        // Função de estruturação de criação de auditoria
        const dadosAuditoria = await StructureDataAuditoriaCreate(
          'CONTADOR_CRACHA',
          criar.id,
          dadosSemId,
          createContadorCrachaDto.registradoPorId,
        );
        // Função de criação de auditoria
        await this.auditoria.create(dadosAuditoria);
        // Retorno da criação do constador de cracha
        return criar;
      });
      this.logger.log('Contador de crachá criada com sucesso.');
      return plainToClass(ResponseContadorCrachaDto, criarContador);
    } catch (error) {
      this.logger.error('Falha ao cadastrar o contador de crachás.');
      throw error;
    }
  }
  // LISTAGEM DE CONTADORES DE CRACHAS
  async findAllAccountant(): Promise<ResponseContadorAdminDto[]> {
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
  async findOneAccountant(id: string): Promise<ResponseContadorAdminDto> {
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
  async findEnterpriseAccountant(
    id: string,
  ): Promise<ResponseContadorEnterpriseDto> {
    try {
      const buscar = await this.prisma.contadorDeCracha.findFirst({
        where: { empresaId: id },
      });

      return plainToClass(ResponseContadorEnterpriseDto, buscar);
    } catch (error) {
      this.logger.error('Falha na busca do contador de cracha.');
      throw error;
    }
  }
  // ATUALIZA O ATRIBUTO CONTADOR A CADA CADASTRO DE UM NOVO USUARIO DA EMPRESA CADASTRANTE
  async updateAccountant(
    updateContadorCrachaDto: UpdateContadorCrachaDto,
  ): Promise<ResponseContadorAdminDto> {
    try {
      const atualizarContador = await this.prisma.$transaction(async (tx) => {
        const buscarContador = await this.findEnterpriseAccountant(
          updateContadorCrachaDto.empresaId,
        );
        const dadosAntes = ExtractDataAuditoria(buscarContador);
        const atualizar = await this.prisma.contadorDeCracha.update({
          where: { id: buscarContador.id },
          data: { contador: { increment: 1 } },
        });
        const dadosdepois = await ExtractDataAuditoria(atualizar);
        const dadosAuditoria = StructureDataAuditoriaUpdate(
          'CONTADOR_CRACHA',
          atualizar.id,
          dadosAntes,
          dadosdepois,
          updateContadorCrachaDto.registradoPorId,
        );
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
  async deactiveAccountant(updateContadorCrachaDto: UpdateContadorCrachaDto) {
    try {
      const inativarContador = this.prisma.$transaction(async (tx) => {
        const buscarContador = await this.findEnterpriseAccountant(
          updateContadorCrachaDto.empresaId,
        );
        const antesSemId = await ExtractDataAuditoria(buscarContador);

        const inativarContador = await tx.contadorDeCracha.update({
          where: { id: buscarContador.id },
          data: { status: false },
        });
        const depoisSemId = await ExtractDataAuditoria(inativarContador);

        const dadosAtualizados = StructureDataAuditoriaUpdate(
          'CONTADOR_CRACHA',
          buscarContador.id,
          antesSemId,
          depoisSemId,
          updateContadorCrachaDto.registradoPorId,
        );

        await this.auditoria.update(dadosAtualizados);

        return inativarContador;
      });
      return plainToClass(ResponseContadorAdminDto, inativarContador);
    } catch (error) {
      this.logger.error('Falha ao inativar o contador de cracha.');
      throw error;
    }
  }
  // REMOVER DADO DO BANCO PELO ID
  async removeAccountant(
    id: string,
    registradoPorId: string,
  ): Promise<ResponseContadorCrachaDto> {
    try {
      const removerContador = await this.prisma.$transaction(async (tx) => {
        const remover = await tx.contadorDeCracha.delete({
          where: { id: id },
        });
        const dadosSemId = await ExtractDataAuditoria(remover);
        const dadosAuditoria = await StructureDataAuditoriaCreate(
          'CONTADOR-CRACHA',
          remover.id,
          dadosSemId,
          registradoPorId,
        );
        await this.auditoria.create(dadosAuditoria);
      });
      return plainToClass(ResponseContadorCrachaDto, removerContador);
    } catch (error) {
      this.logger.error('Falha ao remover o contador de crachá.');
      throw error;
    }
  }
}
