import { Expose } from 'class-transformer';

export class ResponseFalhasDto {
  @Expose() id!: string;
  @Expose() codigo!: number;
  @Expose() descricao!: string;
  @Expose() ativoId!: string;
  @Expose() direcionamentoId!: string;
  @Expose() status!: boolean;
}
