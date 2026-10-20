import { SituacaoPenalidade } from '@/generated/prisma/enums';
import { PrismaService } from '@/prisma/prisma.service';
import { TYPES_NOTICES } from '@/utils/types-notices.cosnt';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, Interval } from '@nestjs/schedule';

@Injectable()
export class PenalidadesScheduleService {
  private logger = new Logger(PenalidadesScheduleService.name);

  constructor(private readonly prisma: PrismaService) {}

  /*
  @Interval(60_000)
  @Cron('0 0 * * *', {
    name: 'finalizar-penalidades',
    timeZone: 'America/Sao_Paulo',
  })
  */

  async updateSituationPenalty(): Promise<void> {
    try {
      const agora = new Date();

      const ativadas = await this.prisma.client.penalidade.updateMany({
        where: {
          situacaoPenalidade: SituacaoPenalidade.PENDENTE,
          dataInicial: { lte: agora },
          dataFinal: { gte: agora },
          status: true,
        },
        data: {
          situacaoPenalidade: SituacaoPenalidade.EXECUCAO,
        },
      });

      if (ativadas.count > 0) {
        this.logger.log(
          `[PENALIDADE_SCHEDULE] ${ativadas.count} penalidade(s) entrou(em) em execução automaticamente.`,
        );
      } else {
        this.logger.log(
          `[PENALIDADE_SCHEDULE] ${ativadas.count} penalidade(s) não teve alteração na execução.`,
        );
      }

      const finalizadas = await this.prisma.client.penalidade.updateMany({
        where: {
          situacaoPenalidade: SituacaoPenalidade.EXECUCAO,
          dataFinal: { lt: agora },
          status: true,
        },
        data: {
          situacaoPenalidade: SituacaoPenalidade.FINALIZADA,
        },
      });

      if (finalizadas.count > 0) {
        this.logger.log(
          `[PENALIDADE_SCHEDULE] ${finalizadas.count} penalidade(s) finalizada(s) automaticamente.`,
        );
      } else {
        this.logger.log(
          `[PENALIDADE_SCHEDULE] ${finalizadas.count} penalidade(s) não teve alteração na finalização.`,
        );
      }
    } catch (error) {
      this.logger.error(
        TYPES_NOTICES.SCHEDULE_FAILURE,
        ' - updateSituationPenalty()',
      );
      throw error;
    }
  }
}
