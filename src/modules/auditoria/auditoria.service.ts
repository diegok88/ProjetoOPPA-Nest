import { Prisma } from '@/generated/prisma/client';
import { Acao } from '@/generated/prisma/enums';
import { PrismaService } from '@/prisma/prisma.service';
import { TYPES_NOTICES } from '@/utils/types-notices.cosnt';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateAuditoriaDto } from './dto/create-auditoria.dto';
import {
  QueryAuditoriaFilterDto,
  QueryAuditoriaFindOneLastDto,
} from './dto/query-auditoria.dto';
import { ResponseAuditoriaDto } from './dto/response-auditoria.dto';
import { UpdateAuditoriaDto } from './dto/update-auditoria.dto';

@Injectable()
export class AuditoriaService {
  private logger = new Logger(AuditoriaService.name);

  constructor(private readonly prisma: PrismaService) {}

  // SERVIÇO DE CALCULAR DIFERENÇAS ENTRE DOIS DADOS
  private calculateDifference<T extends Record<string, any>>(
    antes: T,
    depois: T,
  ): Record<string, { antes: any; depois: any }> {
    const mudancas: Record<string, { antes: any; depois: any }> = {};
    const todasChaves = new Set([
      ...Object.keys(antes || {}),
      ...Object.keys(depois || {}),
    ]);
    for (const chave of todasChaves) {
      const valorAntes = antes?.[chave];
      const valorDepois = depois?.[chave];

      if (JSON.stringify(valorAntes) !== JSON.stringify(valorDepois)) {
        mudancas[chave] = {
          antes: valorAntes,
          depois: valorDepois,
        };
      }
    }
    return mudancas;
  }

  // SERVIÇO DE CRIAÇÃO DO OBJETO AUDITORIA PARA DADOS DA AÇÃO CREATE
  async create(
    createAuditoriaDto: CreateAuditoriaDto,
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    try {
      const { dadosRegistrados, ...dados } = createAuditoriaDto;
      const formatString = JSON.stringify(dadosRegistrados);
      const client = tx ?? this.prisma;

      await client.auditoria.create({
        data: { ...dados, dadosRegistrados: formatString },
      });

      this.logger.log(TYPES_NOTICES.CREATE);
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - CREATE');
      throw error;
    }
  }

  // SERVIÇO DE CRIAÇÃO DE OBJETOS PARA AÇÃO DE DELETE
  // Os creates possuem transformação de json para string de formas diferentes
  async createAll(
    items: Array<CreateAuditoriaDto>,
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    try {
      const client = tx || this.prisma;

      await client.auditoria.createMany({
        data: items,
      });

      this.logger.log(TYPES_NOTICES.CREATE_MANY);
    } catch (error) {
      this.logger.log(TYPES_NOTICES.SERVICE_FAILURE, ' - CREATEALL');
      throw error;
    }
  }

  // SERVIÇO DE CRIAÇÃO DO OBJETO AUDITORIA PARA DADOS DA AÇÃO UPDATE
  async update(
    updateAuditoriaDto: UpdateAuditoriaDto,
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    try {
      const client = tx ?? this.prisma;

      const { antes, depois, ...dados } = updateAuditoriaDto;

      const mudancas = this.calculateDifference(antes, depois);
      const camposAlterados = Object.keys(mudancas);

      const dadosAuditoria = {
        mudancas: mudancas,
        camposAlterados: camposAlterados,
        totalMudancas: camposAlterados.length,
      };

      const dadosAtualizados = JSON.stringify(dadosAuditoria);

      await client.auditoria.create({
        data: {
          ...dados,
          dadosRegistrados: dadosAtualizados,
        },
      });

      this.logger.log(TYPES_NOTICES.UPDATE);
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - UPDATE');
      throw error;
    }
  }

  // SERVIÇO DE CRIAÇÃO DE UMA LISTA DE DADOS ATUALIZADOS PARA CADASTRO DE AUDITORIA
  async updateAll(
    items: Array<UpdateAuditoriaDto>,
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    try {
      const client = tx || this.prisma;

      const dadosAtualizados = items.map((item) => {
        const mudancas = this.calculateDifference(item.antes, item.depois);
        const camposAlterados = Object.keys(mudancas);
        const dados = {
          mudancas,
          camposAlterados,
          totalMudancas: camposAlterados.length,
        };
        return {
          entidade: item.entidade,
          registroId: item.registroId,
          acao: Acao.UPDATE,
          dadosRegistrados: JSON.stringify(dados),
          empresaId: item.empresaId,
          registradoPorId: item.registradoPorId,
        };
      });
      await client.auditoria.createMany({
        data: dadosAtualizados,
      });

      this.logger.log(TYPES_NOTICES.UPDATE_MANY);
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - UPDATEALL');
      throw error;
    }
  }

  // SERVIÇO DE LISTAGEM DE AUDITORIAS CADASTRADAS - SOMENTE PERFIL MASTER
  async findAll(
    query: QueryAuditoriaFilterDto,
  ): Promise<ResponseAuditoriaDto[]> {
    try {
      const condicao: Prisma.AuditoriaWhereInput = {};

      if (query.acao) condicao.acao = query.acao;
      if (query.dataHora) condicao.dataHora = query.dataHora;
      if (query.empresaId) condicao.empresaId = query.empresaId;
      if (query.entidade) condicao.entidade = query.entidade;
      if (query.registradoPorId)
        condicao.registradoPorId = query.registradoPorId;
      if (query.registroId) condicao.registroId = query.registroId;

      const listarRegistros = await this.prisma.auditoria.findMany({
        where: condicao,
      });

      if (listarRegistros.length === 0) {
        this.logger.warn(TYPES_NOTICES.EMPTY_LIST);
      }

      this.logger.log(TYPES_NOTICES.FIND_ALL);
      return listarRegistros.map((lista) => lista);
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - FINDALL');
      throw error;
    }
  }

  // SERVIÇO DE BUSCA DE AUDITORIA POR ID - SOMENTE PERFIL MASTER
  async findOne(id: string): Promise<ResponseAuditoriaDto> {
    try {
      const buscar = await this.prisma.auditoria.findUnique({
        where: { id: id },
      });

      if (!buscar) {
        this.logger.warn(TYPES_NOTICES.NOT_FOUND);
        throw new NotFoundException();
      }

      this.logger.log(TYPES_NOTICES.FIND_ONE);
      return buscar;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - FINDONE');
      throw error;
    }
  }

  // SERVIÇO DE BUSCA DE DADOS SEM ID
  async findOneLast(
    query: QueryAuditoriaFindOneLastDto,
  ): Promise<ResponseAuditoriaDto> {
    try {
      const condicao: Prisma.AuditoriaWhereInput = {};
      condicao.acao = query.acao;
      condicao.empresaId = query.empresaId;
      condicao.registradoPorId = query.registradoPorId;

      const buscar = await this.prisma.auditoria.findFirst({
        where: condicao,
      });

      if (!buscar) {
        throw new NotFoundException();
      }

      return buscar;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - FINDONELAST');
      throw error;
    }
  }

  // SERVIÇO DE ELIMINAÇÃO DE AUDITORIA POR ID
  async remove(id: string): Promise<{ message: string }> {
    try {
      await this.prisma.auditoria.delete({
        where: { id: id },
      });

      this.logger.log(TYPES_NOTICES.DELETE);
      return { message: TYPES_NOTICES.DELETE };
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE, ' - REMOVE');
      throw error;
    }
  }
}
