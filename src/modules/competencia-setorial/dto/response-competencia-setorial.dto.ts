import { TipoTurno } from '@/generated/prisma/enums';
import { Expose, Type } from 'class-transformer';

export class ResponseCompSetSetorDto {
  @Expose()
  id!: string;

  @Expose()
  codigo!: number;

  @Expose()
  descricao!: string;
}

export class ResponseCompetenciaSetorialDto {
  @Expose()
  id!: string;

  @Expose()
  codigo!: number;

  @Expose()
  colaboradorId!: string;

  @Expose()
  gestorId!: string;

  @Expose()
  setorId!: string;

  @Expose()
  turno!: TipoTurno;

  @Expose()
  status!: string;
}

export class ResponseCompetenciaRelacaoDto extends ResponseCompetenciaSetorialDto {
  @Expose()
  @Type(() => ResponseCompSetSetorDto)
  setor!: ResponseCompSetSetorDto;
}

export class ResponseCompetenciaSetorialTagsDto {
  @Expose() id!: string;
  @Expose() codigo!: number;
  @Expose() descricao!: string;
  @Expose() desAtivo!: string;
}

/* DTO DO CONTADOR: retorna total, ativos e inativos */
export class ResponseCompetenciaSetorialContadorDto {
  @Expose()
  total!: number;

  @Expose()
  ativos!: number;

  @Expose()
  inativos!: number;
}

export class ResponseCompSetContadorSupDto {
  @Expose()
  total!: number;
}

export class ResponseCompSetSectionSelectDto {
  @Expose()
  id?: string;

  @Expose()
  codigo?: number;

  @Expose()
  descricao?: string;
}

export class ResponseSetorGestorDto {
  @Expose() setorId!: string;
  @Expose() codigo!: number;
  @Expose() descricao!: string;
  @Expose() turno!: string;
  @Expose() totalAtivos!: number;
  @Expose() produzindo!: number;
  @Expose() parado!: number;
  @Expose() falha!: number;
}
