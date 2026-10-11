import { Expose, Type } from 'class-transformer';

export class ResponseFalhasAtivoDto {
  @Expose() descricao!: string;
  @Expose() modelo!: string;
}

export class ResponseFalhasPerfilDto {
  @Expose() descricao!: string;
  @Expose() nivel!: string;
}

export class ResponseFalhasDto {
  @Expose() id!: string;
  @Expose() codigo!: string;
  @Expose() descricao!: string;
  @Expose() ativoId!: string;
  @Expose() direcionamentoId!: string;
  @Expose() status!: boolean;
}

export class ResponseTagAtivoRelacaoDto extends ResponseFalhasDto {
  @Expose()
  @Type(() => ResponseFalhasAtivoDto)
  ativo!: ResponseFalhasAtivoDto;

  @Expose()
  @Type(() => ResponseFalhasPerfilDto)
  perfil!: ResponseFalhasPerfilDto;
}

export class ResponseFalhasContadorDto {
  @Expose()
  total!: number;

  @Expose()
  inativos!: number;

  @Expose()
  ativos!: number;
}
