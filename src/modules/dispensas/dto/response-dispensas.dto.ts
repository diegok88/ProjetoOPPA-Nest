import { SituacaoDispensa, TipoDispensa } from '@/generated/prisma/enums';
import { Expose } from 'class-transformer';

export class ResponseDispensaDto {
  @Expose() id!: string;
  @Expose() codigo!: number;
  @Expose() colaboradorId!: string;
  @Expose() gestorId!: string;
  @Expose() tipoDispensa!: TipoDispensa;
  @Expose() situacaoDispensa!: SituacaoDispensa;
  @Expose() dataInicial!: Date;
  @Expose() dataFinal!: Date;
  @Expose() status!: boolean;
}

export class ResponseDispensaContadorDto {
  @Expose() total!: number;
  @Expose() pendente!: number;
  @Expose() cancelada!: number;
  @Expose() execucao!: number;
  @Expose() finalizada!: number;
  @Expose() atestado!: number;
  @Expose() bancoDeHoras!: number;
  @Expose() ferias!: number;
}

export class ResponseAlertDispensaDto {
  @Expose() penalidade!: number;
  @Expose() dispensa!: number;
}
