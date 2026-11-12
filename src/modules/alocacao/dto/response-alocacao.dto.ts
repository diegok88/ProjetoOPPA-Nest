import { Expose, Type } from 'class-transformer';
import {
  CondicaoAlocacao,
  SituacaoAlocacao,
  TipoTurno,
} from '@/generated/prisma/enums';

export class ResponseAlocacaoSetorDto {
  @Expose() id!: string;
  @Expose() descricao!: string;
}

export class ResponseAlocacaoAtivoDto {
  @Expose() id!: string;
  @Expose() descricao!: string;
  @Expose() modelo!: string;
  @Expose() setorId!: string;
  @Expose()
  @Type(() => ResponseAlocacaoSetorDto)
  setor!: ResponseAlocacaoSetorDto;
}

export class ResponseAlocacaoTagAtivoDto { 
  @Expose() id!: string;
  @Expose() descricao!: string;
  @Expose()
  @Type(() => ResponseAlocacaoAtivoDto)
  ativo!: ResponseAlocacaoAtivoDto;
}

export class ResponseAlocacaoOperadorDto {
  @Expose() id!: string;
  @Expose() cracha!: number;
  @Expose() nome!: string;
  @Expose() turno!: TipoTurno;
}

export class ResponseAlocacaoDto {
  @Expose() id!: string;
  @Expose() codigo!: number;
  @Expose() operadorId!: string;
  @Expose() gestorId!: string;
  @Expose() tagAtivoId!: string;
  @Expose() turno!: TipoTurno;
  @Expose() alocadoEm!: Date;
  @Expose() finalizadoEm!: Date;
  @Expose() condicao!: CondicaoAlocacao;
  @Expose() situacao!: SituacaoAlocacao;
  @Expose() status!: boolean;
}

export class ResponseAlocacaoRelacaoDto extends ResponseAlocacaoDto {
  @Expose()
  @Type(() => ResponseAlocacaoTagAtivoDto)
  tagAtivo!: ResponseAlocacaoTagAtivoDto;

  @Expose()
  @Type(() => ResponseAlocacaoOperadorDto)
  operador!: ResponseAlocacaoOperadorDto;
}

export class ResponseAlocacaoPaginadaDto {
  @Expose()
  @Type(() => ResponseAlocacaoRelacaoDto)
  dados!: ResponseAlocacaoRelacaoDto[];

  @Expose() total!: number;
  @Expose() pagina!: number;
  @Expose() tamanho!: number;
}

export class ResponseAlocacaoContadorDto {
  @Expose() total!: number;
  @Expose() aceito!: number;
  @Expose() recusado!: number;
  @Expose() aguardando!: number;
  @Expose() alocado!: number;
  @Expose() disponivel!: number;
  @Expose() indisponivel!: number;
  @Expose() finalizado!: number;
}

export class ResponseAlertAlocacaoDto {
  @Expose() alocacao!: number;
}
