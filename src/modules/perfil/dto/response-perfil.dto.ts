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

export class ResponsePerfilListDto {
  @Expose()
  id!: string;

  @Expose()
  descricao!: string;

  @Expose()
  nivel!: string;
}
