import { Injectable, Logger } from '@nestjs/common';
import { CreateAuditoriaDto } from './dto/create-auditoria.dto';
import { UpdateAuditoriaDto } from './dto/update-auditoria.dto';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class AuditoriaService {
  private logger = new Logger(AuditoriaService.name);

  constructor(private readonly prisma: PrismaService) {}

  // SERVIÇO DE CALCULAR DIFERENÇAS ENTRE DOIS DADOS
  private calculateDifference<T extends Record<string, unknown>>(
    antes: T,
    depois: T,
  ): Record<string, { antes: unknown; depois: unknown }> {
    const mudancas: Record<string, { antes: unknown; depois: unknown }> = {};
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

  create(createAuditoriaDto: CreateAuditoriaDto) {
    return 'This action adds a new auditoria';
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
