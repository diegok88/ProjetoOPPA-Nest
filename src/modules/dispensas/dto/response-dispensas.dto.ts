import { Expose } from 'class-transformer';

export class ResponseDispensaDto {
  @Expose() id!: string;
  @Expose() usuarioId!: string;
  @Expose() gestorId!: string;
  @Expose() tipoDispensa!: string;
  @Expose() dataInicial!: Date;
  @Expose() dataFinal!: Date;
  @Expose() status!: boolean;
}
