import { OmitType } from '@nestjs/mapped-types';
import { Expose } from 'class-transformer';

export class ResponseContadorCrachaDto {
  @Expose()
  id!: string;

  @Expose()
  empresaId!: string;

  @Expose()
  contador!: string;

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
