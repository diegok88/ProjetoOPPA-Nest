import { Expose } from 'class-transformer';

export class ResponseOcorrenciaDto {
  @Expose() id!: string;
  @Expose() estadoAtivoId!: string;
  @Expose() falhaId!: string;
  @Expose() solucaoId!: string;
  @Expose() tipoOcorrencia!: string;
  @Expose() solucionadoId!: string;
  @Expose() dataInicial!: Date;
  @Expose() dataFinal!: Date;
  @Expose() status!: boolean;
}
