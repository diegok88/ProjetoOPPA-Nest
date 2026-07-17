import { Expose } from 'class-transformer';

export class ResponsePerfilDto {
  @Expose()
  id!: string;

  @Expose()
  codigo!: number;

  @Expose()
  descricao!: string;

  @Expose()
  status!: boolean;
}
