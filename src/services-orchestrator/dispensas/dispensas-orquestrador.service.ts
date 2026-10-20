import { Prisma, SituacaoDispensa } from '@/generated/prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import { TYPES_NOTICES } from '@/utils/types-notices.cosnt';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';

interface CheckDismissal {
  usuarioId: string;
  dataInicial: Date;
  dataFinal: Date;
}

@Injectable()
export class DispensasOrquestradorService {
  private logger = new Logger(DispensasOrquestradorService.name);

  constructor(private readonly prisma: PrismaService) {}

  async checkEmployeeDismissal(
    verificar: CheckDismissal,
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    try {
      const client = tx ?? this.prisma.client;

      const condicao: Prisma.DispensaWhereInput = {};
      condicao.colaboradorId = verificar.usuarioId;
      condicao.AND = [
        { dataInicial: { lte: verificar.dataFinal } },
        { dataFinal: { gte: verificar.dataInicial } },
        {
          situacaoDispensa: {
            notIn: [SituacaoDispensa.FINALIZADA, SituacaoDispensa.CANCELADA],
          },
        },
      ];

      const qtdDispensas = await client.dispensa.count({ where: condicao });

      if (qtdDispensas > 0) {
        this.logger.error(
          `O colaborador possui ${qtdDispensas} dispensas nas datas solicitadas`,
        );
        throw new UnauthorizedException(
          `O colaborador possui ${qtdDispensas} dispensas nas datas solicitadas`,
        );
      }

      this.logger.log(TYPES_NOTICES.EMPTY_LIST);
    } catch (error) {
      this.logger.error(
        TYPES_NOTICES.SERVICE_FAILURE,
        ' - checkEmployeeDismissal()',
      );
      throw error;
    }
  }

  async checkManagerDismissal(
    verificar: CheckDismissal,
    tx?: Prisma.TransactionClient,
  ): Promise<number> {
    try {
      const client = tx ?? this.prisma.client;

      const condicao: Prisma.DispensaWhereInput = {};
      condicao.gestorId = verificar.usuarioId;
      condicao.AND = [
        { dataInicial: { lte: verificar.dataFinal } },
        { dataFinal: { gte: verificar.dataInicial } },
        {
          situacaoDispensa: {
            notIn: [SituacaoDispensa.FINALIZADA, SituacaoDispensa.CANCELADA],
          },
        },
      ];

      const qtdDispensas = await client.dispensa.count({ where: condicao });

      if (qtdDispensas > 0) {
        this.logger.log(TYPES_NOTICES.EMPTY_NOT, ` - ${qtdDispensas}`);
      }

      return qtdDispensas;
    } catch (error) {
      this.logger.error(
        TYPES_NOTICES.SERVICE_FAILURE,
        ' - checkManagerDismissal()',
      );
      throw error;
    }
  }
}
