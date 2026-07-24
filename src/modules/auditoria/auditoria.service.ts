import { PrismaService } from '@/prisma/prisma.service';
import { Injectable, Logger } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { CreateAuditoriaDto } from './dto/create-auditoria.dto';
import { ResponseAuditoriaDto } from './dto/response-auditoria.dto';
import { UpdateAuditoriaDto } from './dto/update-auditoria.dto';
import { Acao } from '@/generated/prisma/enums';
import { Prisma } from '@/generated/prisma/client';
import { QueryAuditoriaRegisteredByIdDto } from './dto/query-auditoria.dto';

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
  ): Promise<ResponseAuditoriaDto> {
    try {
      const { dadosRegistrados, ...dados } = createAuditoriaDto;
      const formatString = JSON.stringify(dadosRegistrados);

      const client = tx ?? this.prisma;

      const criarAuditoria = await client.auditoria.create({
        data: { ...dados, dadosRegistrados: formatString },
      });

      this.logger.log('Registro de auditoria gerada com sucesso.');
      return plainToClass(ResponseAuditoriaDto, criarAuditoria);
    } catch (error) {
      this.logger.error('Falha na criação do registro de auditoria - CREATE.');
      throw error;
    }
  }

  // SERVIÇO DE CRIAÇÃO DE OBJETOS PARA AÇÃO DE DELETE
  async createAll(
    items: Array<CreateAuditoriaDto>,
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    try {
      const client = tx || this.prisma;

      await client.auditoria.createMany({
        data: items,
      });
    } catch (error) {
      this.logger.log('Falha na criação da lista de auditorias - CREATE ALL');
      throw error;
    }
  }

  // SERVIÇO DE CRIAÇÃO DO OBJETO AUDITORIA PARA DADOS DA AÇÃO UPDATE
  async update(
    updateAuditoriaDto: UpdateAuditoriaDto,
    tx?: Prisma.TransactionClient,
  ): Promise<ResponseAuditoriaDto> {
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

      const criarAuditoria = await client.auditoria.create({
        data: {
          ...dados,
          dadosRegistrados: dadosAtualizados,
        },
      });
      return plainToClass(ResponseAuditoriaDto, criarAuditoria);
    } catch (error) {
      this.logger.error('Falha na criação do registro de auditoria - UPDATE.');
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
    } catch (error) {
      this.logger.error('Falha na criação da lista de auditorias - UPDATE ALL');
      throw error;
    }
  }

  // SERVIÇO DE LISTAGEM DE AUDITORIAS CADASTRADAS - SOMENTE PERFIL MASTER
  async findAll(): Promise<ResponseAuditoriaDto[]> {
    try {
      const listarRegistros = await this.prisma.auditoria.findMany();
      this.logger.log('Lista de registros de auditoria gerada com sucesso.');

      return listarRegistros.map((lista) =>
        plainToClass(ResponseAuditoriaDto, lista),
      );
    } catch (error) {
      this.logger.error('Falha ao listar registros de auditoria.');
      throw error;
    }
  }

  // SERVIÇO DE BUSCA DE AUDITORIA POR ID - SOMENTE PERFIL MASTER
  async findOne(id: string): Promise<ResponseAuditoriaDto> {
    try {
      const buscar = await this.prisma.auditoria.findUnique({
        where: { id: id },
      });
      this.logger.log(`Busca da auditoria por id ${id} gerada com sucesso.`);
      return plainToClass(ResponseAuditoriaDto, buscar);
    } catch (error) {
      this.logger.error('Falha na busca da auditoria.');
      throw error;
    }
  }

  // SERVIÇO DE LISTAGEM DE DADOS PELO ATRIBUTO REGISTRADO POR ID E EMPRESA ID
  async findRegisteredById(
    query: QueryAuditoriaRegisteredByIdDto,
  ): Promise<ResponseAuditoriaDto[]> {
    try {
      const where: Prisma.AuditoriaWhereInput = {};
      if (query?.registroId) {
        where.registroId = query.registroId;
      }
      if (query.registradoPorId && query.empresaId) {
        where.empresaId = query.empresaId;
        where.registradoPorId = query.registradoPorId;
      }

      const listar = await this.prisma.auditoria.findMany({
        where,
      });
      this.logger.log(
        this.logger.log(
          'Lista de auditoria gerada com sucesso - findRegisteredById.',
        ),
      );
      return listar.map((lista) => plainToClass(ResponseAuditoriaDto, lista));
    } catch (error) {
      this.logger.error('Falha ao listar registros de auditoria.');
      throw error;
    }
  }

  // SERVIÇO DE ELIMINAÇÃO DE AUDITORIA POR ID
  async remove(id: string): Promise<ResponseAuditoriaDto> {
    try {
      const deletar = await this.prisma.auditoria.delete({
        where: { id: id },
      });
      this.logger.log(`Delete da auditoria ${id} realizada com sucesso`);
      return plainToClass(ResponseAuditoriaDto, deletar);
    } catch (error) {
      this.logger.error('Falha ao deletar o registro de auditoria.');
      throw error;
    }
  }
}
