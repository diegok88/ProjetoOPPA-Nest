import { TipoEstadoAtivo } from '@/generated/prisma/enums';
import { Expose } from 'class-transformer';

export class ResponseEstadoAtivoDto {
  @Expose() id!: string;
  @Expose() alocacaoId!: string;
  @Expose() tagAtivoId!: string;
  @Expose() tipoEstado!: TipoEstadoAtivo;
  @Expose() dataInicial!: Date;
  @Expose() dataFinal!: Date;
  @Expose() duracao!: number;
  @Expose() status!: boolean;
}
