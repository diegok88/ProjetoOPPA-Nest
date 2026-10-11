import { Expose, Type } from 'class-transformer';

export class ResponseSolucoesFalhaDto {
  @Expose() codigo!: string;
  @Expose() descricao!: string;
}

export class ResponseSolucoesPerfilDto {
  @Expose() descricao!: string;
  @Expose() nivel!: string;
}

export class ResponseSolucoesDto {
  @Expose() id!: string;
  @Expose() codigo!: number;
  @Expose() falhaId!: string;
  @Expose() direcionamentoId!: string;
  @Expose() descricao!: string;
  @Expose() status!: boolean;
}

export class ResponseSolucoesRelacaoDto extends ResponseSolucoesDto {
  @Expose()
  @Type(() => ResponseSolucoesFalhaDto)
  falha!: ResponseSolucoesFalhaDto;

  @Expose()
  @Type(() => ResponseSolucoesPerfilDto)
  perfil!: ResponseSolucoesPerfilDto;
}

export class ResponseSolucoesContadorDto {
  @Expose()
  total!: number;

  @Expose()
  inativos!: number;

  @Expose()
  ativos!: number;
}
