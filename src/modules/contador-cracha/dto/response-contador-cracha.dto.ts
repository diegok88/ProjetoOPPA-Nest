import { Expose } from 'class-transformer';

export class ResponseContadorCrachaDto {
  @Expose()
  id!: string;

  @Expose()
  empresaId!: string;

  @Expose()
  nomeEmpresa!: string;

  @Expose()
  contador!: string;

  @Expose()
  status!: boolean;
}
