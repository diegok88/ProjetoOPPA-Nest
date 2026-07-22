import { OmitType } from '@nestjs/mapped-types';
import { Expose, Type } from 'class-transformer';
import { native } from 'pg';

export class ResponseContadorCrachaDto {
  @Expose()
  id!: string;

  @Expose()
  empresaId!: string;

  @Expose()
  contador!: number;

  @Expose()
  status!: boolean;
}

export class ResponseContadorAdminDto extends OmitType(
  ResponseContadorCrachaDto,
  ['empresaId'],
) {
  @Expose()
  nomeEmpresa!: string;
}

export class ResponseContadorEnterpriseDto extends OmitType(
  ResponseContadorCrachaDto,
  ['empresaId', 'status'],
) {}
