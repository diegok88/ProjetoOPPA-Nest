import { Expose, Type } from 'class-transformer';

export class ResponseOcorrenciaFalhaDto {
  @Expose() id!: string;
  @Expose() codigo!: string;
  @Expose() descricao!: string;
}

export class ResponseOcorrenciaDto {
  @Expose() id!: string;
  @Expose() estadoAtivoId!: string;
  @Expose() falhaId!: string;
  @Expose() solucaoId!: string;
  @Expose() tipoOcorrencia!: string;
  @Expose() condicaoOcorrencia!: string;
  @Expose() solucionadoId!: string;
  @Expose() dataInicial!: Date;
  @Expose() dataFinal!: Date;
  @Expose() status!: boolean;
}

export class ResponseOcorrenciaRelacaoDto extends ResponseOcorrenciaDto {
  @Expose()
  @Type(() => ResponseOcorrenciaFalhaDto)
  falhas!: ResponseOcorrenciaFalhaDto;
}

export class ResponseOcorrenciaPaginadaDto {
  @Expose()
  @Type(() => ResponseOcorrenciaRelacaoDto)
  dados!: ResponseOcorrenciaRelacaoDto[];

  @Expose() total!: number;
  @Expose() pagina!: number;
  @Expose() tamanho!: number;
}
