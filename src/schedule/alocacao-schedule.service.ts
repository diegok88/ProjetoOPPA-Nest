import {
  CondicaoAlocacao,
  Prisma,
  SituacaoAlocacao,
  SituacaoDispensa,
  SituacaoPenalidade,
  TipoPenalidade,
} from '@/generated/prisma/client';
import { AlocacaoOperacional } from '@/modules/alocacao/entities/alocacao.entity';
import { GeradorEscalaService } from '@/modules/gerador-escala/gerador-escala.service';
import { PrismaService } from '@/prisma/prisma.service';
import { TYPES_NOTICES } from '@/utils/types-notices.cosnt';
import { Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';

@Injectable()
export class AlocacaoScheduleService {
  private logger = new Logger(AlocacaoScheduleService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly geradorEscala: GeradorEscalaService,
  ) {}

  /*
  @Interval(60_000)
  @Cron('0 0 * * *', {
    name: 'desalocar-alocacao',
    timeZone: 'America/Sao_Paulo',
  })
  */
  async deallocate(): Promise<void> {
    try {
      const escalaAtual = await this.geradorEscala.consultarEscala();

      await this.prisma.$transaction(async (tx: any) => {
        /* lista todos as alocação que está alocado e que pertence ao o operador pertence a escala atual */
        const condicao: Prisma.AlocacaoOperacionalWhereInput = {
          situacao: SituacaoAlocacao.ALOCADO,
          operador: { escala: escalaAtual.escala },
        };

        const opcao: Prisma.AlocacaoOperacionalFindManyArgs = {
          where: condicao,
          select: { id: true, tagAtivoId: true, turno: true, gestorId: true },
        };

        const listarAlocacao = await tx.alocacaoOperacional.findMany(opcao);

        this.logger.log(
          `[ALOCAÇÃO_SCHEDULE] ${listarAlocacao.length} alocações encontradas.`,
        );

        /* Extrai os ids da lista de alocação e atualiza como alocação finalizada */
        const ids = listarAlocacao.map(
          (lista: AlocacaoOperacional) => lista.id,
        );

        const atualizar = await tx.alocacaoOperacional.updateMany({
          where: { id: { in: ids } },
          data: {
            situacao: SituacaoAlocacao.FINALIZADO,
            finalizadoEm: new Date(),
          },
        });

        if (atualizar.count > 0) {
          this.logger.log(
            `[ALOCAÇÃO_SCHEDULE] ${atualizar.count} alocado(s) entrou em finalização automaticamente.`,
          );
        } else {
          this.logger.log(
            `[ALOCAÇÃO_SCHEDULE] ${atualizar.count} alocado(s) não teve alteração na finalização.`,
          );
        }

        /* Cria novas alocações apos a atualização das anteriores */
        const criar = await tx.alocacaoOperacional.createMany({
          data: listarAlocacao.map((l: AlocacaoOperacional) => ({
            tagAtivoId: l.tagAtivoId,
            turno: l.turno,
            gestorId: l.gestorId,
            situacao: SituacaoAlocacao.DISPONIVEL,
            condicao: CondicaoAlocacao.AGUARDANDO,
          })),
        });

        if (criar.count > 0) {
          this.logger.log(
            `[ALOCAÇÃO_SCHEDULE] ${criar.count} novos alocado(s) entrou em disponível automaticamente.`,
          );
        } else {
          this.logger.log(
            `[ALOCAÇÃO_SCHEDULE] ${criar.count} novos alocado(s) não teve disponível na execução.`,
          );
        }
      });
    } catch (error) {
      this.logger.log(TYPES_NOTICES.SERVICE_FAILURE, ' - deallocate()');
      throw error;
    }
  }

  /*
  @Interval(60_000)
  @Cron('0 0 * * *', {
    name: 'desalocar-alocacao',
    timeZone: 'America/Sao_Paulo',
  })
  */
  async deallocatePenaltyDismissal(): Promise<void> {
    try {
      await this.prisma.client.$transaction(async (tx: any) => {
        const condicao: Prisma.AlocacaoOperacionalWhereInput = {
          situacao: SituacaoAlocacao.ALOCADO,
          operador: {
            OR: [
              {
                penalidadeComoColaborador: {
                  some: {
                    situacaoPenalidade: SituacaoPenalidade.EXECUCAO,
                    tipoPenalidade: TipoPenalidade.SUSPENSAO,
                  },
                },
              },
              {
                dispensaComoColaborador: {
                  some: { situacaoDispensa: SituacaoDispensa.EXECUCAO },
                },
              },
            ],
          },
        };

        const opcoes: Prisma.AlocacaoOperacionalFindManyArgs = {
          where: condicao,
          select: { id: true, tagAtivoId: true, turno: true, gestorId: true },
        };

        const listar = await tx.alocacaoOperacional.findMany(opcoes);

        this.logger.log(
          `[ALOCAÇÃO_SCHEDULE] ${listar.length} alocações encontradas.`,
        );

        const ids = listar.map((lista: AlocacaoOperacional) => lista.id);

        const atualizar = await this.updateAll(ids, tx);

        if (atualizar.count > 0) {
          this.logger.log(
            `[ALOCAÇÃO_SCHEDULE] ${atualizar.count} alocado(s) entrou em finalização automaticamente.`,
          );
        } else {
          this.logger.log(
            `[ALOCAÇÃO_SCHEDULE] ${atualizar.count} alocado(s) não teve alteração na finalização.`,
          );
        }

        const criar = await this.createAll(listar, tx);

        if (criar.count > 0) {
          this.logger.log(
            `[ALOCAÇÃO_SCHEDULE] ${criar.count} novos alocado(s) entrou em disponível automaticamente.`,
          );
        } else {
          this.logger.log(
            `[ALOCAÇÃO_SCHEDULE] ${criar.count} novos alocado(s) não teve disponível na execução.`,
          );
        }
      });
    } catch (error) {
      this.logger.log(
        TYPES_NOTICES.SERVICE_FAILURE,
        ' - deallocatePenaltyDismissal()',
      );
      throw error;
    }
  }

  private async updateAll(
    ids: Array<string>,
    tx: Prisma.TransactionClient,
  ): Promise<Prisma.BatchPayload> {
    try {
      const atualizar = await tx.alocacaoOperacional.updateMany({
        where: { id: { in: ids } },
        data: {
          situacao: SituacaoAlocacao.FINALIZADO,
          finalizadoEm: new Date(),
        },
      });
      return atualizar;
    } catch (error) {
      this.logger.log(TYPES_NOTICES.SERVICE_FAILURE, ' - updateAll()');
      throw error;
    }
  }

  private async createAll(
    lista: Array<AlocacaoOperacional>,
    tx: Prisma.TransactionClient,
  ): Promise<Prisma.BatchPayload> {
    try {
      const criar = await tx.alocacaoOperacional.createMany({
        data: lista.map((l: AlocacaoOperacional) => ({
          tagAtivoId: l.tagAtivoId,
          turno: l.turno,
          gestorId: l.gestorId,
          situacao: SituacaoAlocacao.DISPONIVEL,
          condicao: CondicaoAlocacao.AGUARDANDO,
        })),
      });
      return criar;
    } catch (error) {
      this.logger.log(TYPES_NOTICES.SERVICE_FAILURE, ' - createAll()');
      throw error;
    }
  }
}
