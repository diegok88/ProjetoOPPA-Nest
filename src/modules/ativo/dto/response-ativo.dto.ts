import { Expose, Type } from 'class-transformer';

export class ResponseAtivoEmpresaDto {
  @Expose() razaoSocial!: string;
}

export class ResponseAtivoSetoresDto {
  @Expose() descricao!: string;
}

export class ResponseAtivoDto {
  @Expose() id!: string;
  @Expose() codigo!: number;
  @Expose() descricao!: string;
  @Expose() modelo!: string;
  @Expose() fabricante!: string;
  @Expose() ano!: number;
  @Expose() setorId!: string;
  @Expose() empresaId!: string;
  @Expose() status!: boolean;
}

export class ResponseAtivoRelacaoDto extends ResponseAtivoDto {
  @Expose()
  @Type(() => ResponseAtivoSetoresDto)
  setor!: ResponseAtivoSetoresDto;

  @Expose()
  @Type(() => ResponseAtivoEmpresaDto)
  empresa!: ResponseAtivoEmpresaDto;
}

export class ResponseAtivoContadorDto {
  @Expose()
  total!: number;

  @Expose()
  ativos!: number;

  @Expose()
  inativos!: number;
}
