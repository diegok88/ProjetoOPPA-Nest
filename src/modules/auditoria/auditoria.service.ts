import { PrismaService } from '@/prisma/prisma.service';
import { Injectable, Logger } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { CreateAuditoriaDto } from './dto/create-auditoria.dto';
import { ResponseAuditoriaDto } from './dto/response-auditoria.dto';
import { UpdateAuditoriaDto } from './dto/update-auditoria.dto';

type DadosAtualizadosAuditoria = {
  mudancas: Record<string, { antes: any; depois: any }>;
  camposAlterados: string[];
  totalMudancas: number;
};

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
      if (
        chave === 'criadoEm' ||
        chave === 'atualizadoEm' ||
        chave === 'dataHora'
      ) {
        continue;
      }
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
  ): Promise<ResponseAuditoriaDto> {
    try {
      const criarAuditoria = await this.prisma.auditoria.create({
        data: createAuditoriaDto,
      });
      this.logger.log('Registro de auditoria gerada com sucesso.');
      return plainToClass(ResponseAuditoriaDto, criarAuditoria);
    } catch (error) {
      this.logger.error('Falha na criação do registro de auditoria - CREATE.');
      throw error;
    }
  }

  // SERVIÇO DE CRIAÇÃO DO OBJETO AUDITORIA PARA DADOS DA AÇÃO UPDATE
  async update(
    updateAuditoriaDto: UpdateAuditoriaDto,
  ): Promise<ResponseAuditoriaDto> {
    try {
      const antes = updateAuditoriaDto.antes;
      const depois = updateAuditoriaDto.depois;

      const mudancas = this.calculateDifference(antes, depois);
      const camposAlterados = Object.keys(mudancas);

      const dadosAuditoria: DadosAtualizadosAuditoria = {
        mudancas: mudancas,
        camposAlterados: camposAlterados,
        totalMudancas: camposAlterados.length,
      };

      const criarAuditoria = this.prisma.auditoria.create({
        data: {
          entidade: updateAuditoriaDto.entidade,
          registroId: updateAuditoriaDto.registroId,
          acao: updateAuditoriaDto.acao,
          dadosRegistrados: dadosAuditoria,
          registradoPorId: updateAuditoriaDto.registradoPorId,
        },
      });
      return plainToClass(ResponseAuditoriaDto, criarAuditoria);
    } catch (error) {
      this.logger.error('Falha na criação do registro de auditoria - UPDATE.');
      throw error;
    }
  }
  // SERVIÇO DE LISTAGEM DE AUDITORIAS CADASTRADAS
  async findAll(): Promise<ResponseAuditoriaDto[]> {
    try {
      const listarRegistros = await this.prisma.auditoria.findMany({});
      this.logger.log('Lista de registros de auditoria gerada com sucesso.');

      return listarRegistros.map((lista) =>
        plainToClass(ResponseAuditoriaDto, lista),
      );
    } catch (error) {
      this.logger.error('Falha ao listar registros de auditoria.');
      throw error;
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} auditoria`;
  }

  remove(id: number) {
    return `This action removes a #${id} auditoria`;
  }
}
