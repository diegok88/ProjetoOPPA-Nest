import { Expose } from 'class-transformer';

export class ResponsePenalidadeDto {
  @Expose() id!: string;
  @Expose() codigo!: number;
  @Expose() colaboradorId!: string;
  @Expose() gestorId!: string;
  @Expose() tipoPenalidade!: string;
  @Expose() dataInicial!: Date;
  @Expose() dataFinal!: Date;
  @Expose() justificativa?: string;
  @Expose() situacaoPenalidade!: string;
  @Expose() status!: boolean;
}

export class ResponsePenalidadeContadorDto {
  @Expose() total!: number;
  @Expose() pendente!: number;
  @Expose() cancelada!: number;
  @Expose() execucao!: number;
  @Expose() finalizada!: number;
  @Expose() orientacao!: number;
  @Expose() advertencia!: number;
  @Expose() suspensao!: number;
}

export class ResponseAlertPenalidadeDto {
  @Expose() penalidade!: number;
  @Expose() dispensa!: number;
}
