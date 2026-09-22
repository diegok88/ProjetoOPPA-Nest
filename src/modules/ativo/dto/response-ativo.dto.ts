import { Expose } from 'class-transformer';

export class ResponseAtivoDto {
  @Expose() id!: string;
  @Expose() descricao!: string;
  @Expose() modelo!: string;
  @Expose() fabricante!: string;
  @Expose() ano!: number;
  @Expose() setorId!: string;
  @Expose() status!: boolean;
}
