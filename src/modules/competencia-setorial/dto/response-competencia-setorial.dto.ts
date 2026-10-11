import { TipoTurno } from '@/generated/prisma/enums';
import { PickType } from '@nestjs/mapped-types';
import { Expose, Type } from 'class-transformer';

export class ResponseCompSetSetorDto {
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

export class ResponseCompetenciaRelacaoDto extends PickType(
  ResponseCompetenciaSetorialDto,
  ['id', 'codigo', 'status'],
) {
  @Expose()
  @Type(() => ResponseCompSetSetorDto)
  setor!: ResponseCompSetSetorDto;
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

export class ResponseCompSetSectionSelectDto {
  @Expose()
  id?: string;

  @Expose()
  codigo?: number;

  @Expose()
  descricao?: string;
}
