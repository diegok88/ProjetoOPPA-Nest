import { Expose } from 'class-transformer';

export class ResponsePenalidadeDto {
  @Expose() id!: string;
  @Expose() usuarioId!: string;
  @Expose() gestorId!: string;
  @Expose() tipoPenalidade!: string;
  @Expose() dataInicial!: Date;
  @Expose() dataFinal!: Date;
  @Expose() justificativa?: string;
  @Expose() status!: boolean;
}
