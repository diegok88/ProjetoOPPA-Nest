import { Expose, Type } from 'class-transformer';

export class ResponseFluxoOcorrenciaPerfilDto {
  @Expose() id!: string;
  @Expose() descricao!: string;
  @Expose() nivel!: string;
}

export class ResponseFluxoOcorrenciaDto {
  @Expose() id!: string;
  @Expose() codigo!: number;
  @Expose() ocorrenciaId!: string;
  @Expose() usuarioId!: string;
  @Expose() transferidoPerfilId!: string;
  @Expose() dataInicial!: Date;
  @Expose() dataFinal!: Date;
  @Expose() duracao!: number;
  @Expose() status!: boolean;
}

export class ResponseFluxoOcorrenciaRelacaoDto extends ResponseFluxoOcorrenciaDto {
  @Expose()
  @Type(() => ResponseFluxoOcorrenciaPerfilDto)
  transferidoPerfil!: ResponseFluxoOcorrenciaPerfilDto;
}

export class ResponseFluxoOcorrenciaPaginadaDto {
  @Expose()
  @Type(() => ResponseFluxoOcorrenciaRelacaoDto)
  dados!: ResponseFluxoOcorrenciaRelacaoDto[];

  @Expose() total!: number;
  @Expose() pagina!: number;
  @Expose() tamanho!: number;
}
