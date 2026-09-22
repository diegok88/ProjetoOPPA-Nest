import { Expose } from 'class-transformer';

export class ResponseSolucoesDto {
  @Expose() id!: string;
  @Expose() falhaId!: string;
  @Expose() direcionamentoId!: string;
  @Expose() descricao!: string;
  @Expose() status!: boolean;
}
