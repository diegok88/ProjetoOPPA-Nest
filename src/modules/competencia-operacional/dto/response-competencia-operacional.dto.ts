import { Expose } from 'class-transformer';

export class ResponseCompetenciaOperacionalDto {
  @Expose() id!: string;
  @Expose() operadorId!: string;
  @Expose() gestorId!: string;
  @Expose() status!: boolean;
}
