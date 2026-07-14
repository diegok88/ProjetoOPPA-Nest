import { PrismaService } from '@/prisma/prisma.service';
import { Injectable, Logger } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { CreateAuditoriaDto } from './dto/create-auditoria.dto';
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
  // SERVIÇO DE CRIAÇÃO DO OBJETO AUDITORIA
  async create(
    createAuditoriaDto: CreateAuditoriaDto,
  ): Promise<ResponseAuditoriaDto> {
    try {
      const criarAuditoria = await this.prisma.auditoria.create({
        data: createAuditoriaDto,
      });
      return plainToClass(ResponseAuditoriaDto, criarAuditoria);
    } catch (error) {
      this.logger.error(`Erro ao registrar criação: $(error.message)`);
      throw error;
    }
  }

  findAll() {
    return `This action returns all auditoria`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auditoria`;
  }

  update(id: number, updateAuditoriaDto: UpdateAuditoriaDto) {
    return `This action updates a #${id} auditoria`;
  }

  remove(id: number) {
    return `This action removes a #${id} auditoria`;
  }
}
