import { Expose, Type } from 'class-transformer';

export class ResponseTagAtivoAtivoDto {
  @Expose() descricao!: string;
  @Expose() modelo!: string;
  @Expose() setorId!: string;
}

export class ResponseTagAtivoDto {
  @Expose() id!: string;
  @Expose() codigo!: number;
  @Expose() descricao!: string;
  @Expose() ativoId!: string;
  @Expose() status!: boolean;
}

export class ResponseTagAtivoRelacaoDto extends ResponseTagAtivoDto {
  @Expose()
  @Type(() => ResponseTagAtivoAtivoDto)
  ativo!: ResponseTagAtivoAtivoDto;
}

export class ResponseTagAtivoPaginadaDto {
  @Expose()
  @Type(() => ResponseTagAtivoRelacaoDto)
  dados!: ResponseTagAtivoRelacaoDto[];

  @Expose() total!: number;
  @Expose() pagina!: number;
  @Expose() tamanho!: number;
}

export class ResponseTagAtivoContadorDto {
  @Expose()
  total!: number;

  @Expose()
  inativos!: number;

  @Expose()
  ativos!: number;
}
