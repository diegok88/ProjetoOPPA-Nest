import { Expose, Type } from 'class-transformer';

export class ResponseTagAtivoAtivoDto {
  @Expose() descricao!: string;
  @Expose() modelo!: string;
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

export class ResponseTagAtivoContadorDto {
  @Expose()
  total!: number;

  @Expose()
  inativos!: number;

  @Expose()
  ativos!: number;
}
