import { Expose } from 'class-transformer';

export class ResponseFluxoOcorrenciaDto {
  @Expose() id!: string;
  @Expose() ocorrenciaId!: string;
  @Expose() usuarioId!: string;
  @Expose() transferidoPerfilId!: string;
  @Expose() dataInicial!: Date;
  @Expose() dataFinal!: Date;
  @Expose() duracao!: number;
}
