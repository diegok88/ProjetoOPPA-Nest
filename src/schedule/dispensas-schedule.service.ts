import { SituacaoDispensa } from '@/generated/prisma/enums';
import { PrismaService } from '@/prisma/prisma.service';
import { TYPES_NOTICES } from '@/utils/types-notices.cosnt';
import { Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';

@Injectable()
export class DispensasScheduleService {
  private logger = new Logger(DispensasScheduleService.name);

  constructor(private readonly prisma: PrismaService) {}

  /*
  @Interval(60_000)
  @Cron('0 0 * * *', {
    name: 'finalizar-dispensas',
    timeZone: 'America/Sao_Paulo',
  })
  */

  async updateSituationDismissal(): Promise<void> {
    try {
      const agora = new Date();

      const ativadas = await this.prisma.client.dispensa.updateMany({
        where: {
          situacaoDispensa: SituacaoDispensa.PENDENTE,
          dataInicial: { lte: agora },
          dataFinal: { gte: agora },
          status: true,
        },
        data: {
          situacaoDispensa: SituacaoDispensa.EXECUCAO,
        },
      });

      if (ativadas.count > 0) {
        this.logger.log(
          `[DISPENSA_SCHEDULE] ${ativadas.count} dispensa(s) entrou(em) em execução automaticamente.`,
        );
      } else {
        this.logger.log(
          `[DISPENSA_SCHEDULE] ${ativadas.count} dispensa(s) não teve alteração na execução.`,
        );
      }

      const finalizadas = await this.prisma.client.dispensa.updateMany({
        where: {
          situacaoDispensa: SituacaoDispensa.EXECUCAO,
          dataFinal: { lt: agora },
          status: true,
        },
        data: {
          situacaoDispensa: SituacaoDispensa.FINALIZADA,
        },
      });

      if (finalizadas.count > 0) {
        this.logger.log(
          `[DISPENSA_SCHEDULE] ${finalizadas.count} dispensa(s) finalizada(s) automaticamente.`,
        );
      } else {
        this.logger.log(
          `[DISPENSA_SCHEDULE] ${finalizadas.count} dispensa(s) não teve alteração na finalização.`,
        );
      }
    } catch (error) {
      this.logger.error(
        TYPES_NOTICES.SCHEDULE_FAILURE,
        ' - updateSituationDismissal()',
      );
      throw error;
    }
  }
}
