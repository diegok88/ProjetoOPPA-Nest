import { Acao, Prisma } from '@/generated/prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import { TYPES_NOTICES } from '@/utils/types-notices.cosnt';
import { Injectable, Logger } from '@nestjs/common';

/*
SERVIÇO DE RELAÇÃO ENTRE USUARIO E COMPETENCIA SETORIAL:
- funcionalidade de evitar a dependencia circular.
- serviço que cria a relação entre duas entidades.
*/

@Injectable()
export class CompetenciaSetorialOrquestradorService {
  private logger = new Logger(CompetenciaSetorialOrquestradorService.name);

  constructor(private readonly prisma: PrismaService) {}

  /*
 SERVIÇO DE INATIVAÇÃO:
 - inativa todas as competencias ao atualizar o turno do gestor.
 */
  async deactiveAllCompSet(
    id: string,
    tx?: Prisma.TransactionClient,
  ): Promise<Prisma.BatchPayload> {
    try {
      const client = tx ?? this.prisma.client;

      const competencia = await client.competenciaSetorial.count({
        where: { colaboradorId: id, status: true },
      });

      if (competencia === 0) {
        return { count: 0 };
      }

      const inativar = await client.competenciaSetorial.updateMany({
        where: { colaboradorId: id, status: true },
        data: { status: false, _auditAction: Acao.DEACTIVATE },
      });

      return inativar;
    } catch (error) {
      this.logger.error(TYPES_NOTICES.SERVICE_FAILURE);
      throw error;
    }
  }
}
