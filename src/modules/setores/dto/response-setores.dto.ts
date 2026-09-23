import { OmitType } from '@nestjs/mapped-types';
import { Expose } from 'class-transformer';

export class ResponseSetoresDto {
  @Expose()
  id!: string;

  @Expose()
  codigo!: number;

  @Expose()
  descricao!: string;

  @Expose()
  empresaId!: string;

  @Expose()
  status!: boolean;
}

export class ResponseSetoresListDto extends OmitType(ResponseSetoresDto, [
  'empresaId',
  'status',
] as const) {}
