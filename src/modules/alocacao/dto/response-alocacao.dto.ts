import { CondicaoAlocacao } from '@/generated/prisma/enums';
import { Expose } from 'class-transformer';

export class ResponseAlocacaoDto {
  @Expose() id!: string;
  @Expose() usuarioId!: string;
  @Expose() tagAtivoId!: string;
  @Expose() condicao!: CondicaoAlocacao;
  @Expose() status!: boolean;
}
