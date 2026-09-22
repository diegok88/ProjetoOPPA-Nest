import { Expose } from 'class-transformer';

export class ResponseTagAtivoDto {
  @Expose() id!: string;
  @Expose() descricao!: string;
  @Expose() ativoId!: string;
  @Expose() senha!: string;
  @Expose() status!: boolean;
}
