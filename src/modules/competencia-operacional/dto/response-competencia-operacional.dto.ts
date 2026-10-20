import { Expose, Type } from 'class-transformer';

export class ResponseCompOperUsuarioDto {
  @Expose() id!: string;
  @Expose() nome!: string;
  @Expose() cracha!: number;
}

export class ResponseCompOperAtivoDto {
  @Expose() id!: string;
  @Expose() descricao!: string;
  @Expose() modelo!: string;
}

export class ResponseCompetenciaOperacionalDto {
  @Expose() id!: string;
  @Expose() codigo?: number;
  @Expose() operadorId!: string;
  @Expose() gestorId!: string;
  @Expose() ativoId?: string;
  @Expose() status!: boolean;

  @Expose()
  @Type(() => ResponseCompOperUsuarioDto)
  operador!: ResponseCompOperUsuarioDto;
  @Expose()
  @Type(() => ResponseCompOperUsuarioDto)
  gestor!: ResponseCompOperUsuarioDto;
  @Expose()
  @Type(() => ResponseCompOperAtivoDto)
  ativo!: ResponseCompOperAtivoDto;
}

/* DTO DO CONTADOR: retorna total, ativos e inativos */
export class ResponseCompetenciaOperacionalContadorDto {
  @Expose() total!: number;
  @Expose() ativos!: number;
  @Expose() inativos!: number;
}

/* DTO DE ATIVOS NÃO ALOCADOS PARA O COLABORADOR */
export class ResponseCompetenciaOperacionalAssetsDto {
  @Expose() id!: string;
  @Expose() codigo!: number;
  @Expose() descricao!: string;
  @Expose() modelo!: string;
}
