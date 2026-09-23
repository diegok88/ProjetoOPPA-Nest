import { OmitType } from '@nestjs/mapped-types';
import { Expose } from 'class-transformer';

export class ResponsePerfilDto {
  @Expose()
  id!: string;

  @Expose()
  codigo!: number;

  @Expose()
  descricao!: string;

  @Expose()
  nivel!: string;

  @Expose()
  status!: boolean;
}

export class ResponsePerfilListDto extends OmitType(ResponsePerfilDto, [
  'status',
] as const) {}

export class ResponsePerfilContadorDto {
  @Expose()
  total!: number;

  @Expose()
  ativos!: number;

  @Expose()
  inativos!: number;
}
