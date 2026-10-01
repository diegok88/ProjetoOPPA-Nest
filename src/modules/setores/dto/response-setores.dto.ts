import { Empresa } from '@/modules/empresa/entities/empresa.entity';
import { OmitType } from '@nestjs/mapped-types';
import { Expose, Type } from 'class-transformer';

export class ResponseSetoresEmpresaDto {
  @Expose()
  razaoSocial!: string;
}

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
  
  @Expose()
  @Type(() => ResponseSetoresEmpresaDto)
  empresa?: ResponseSetoresEmpresaDto;
}

export class ResponseSetoresListDto extends OmitType(ResponseSetoresDto, [
  'empresaId',
  'status',
] as const) {}

export class ResponseSetoresContadorDto {
  @Expose()
  total!: number;

  @Expose()
  ativos!: number;

  @Expose()
  inativos!: number;
}
