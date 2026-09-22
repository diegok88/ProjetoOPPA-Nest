import { Expose } from 'class-transformer';

export class ResponseSetoresDto {
  @Expose()
  id!: string;

  @Expose()
  descricao!: string;

  @Expose()
  empresaId!: string;

  @Expose()
  status!: boolean;
}
