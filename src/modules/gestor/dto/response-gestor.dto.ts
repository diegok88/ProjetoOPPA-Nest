import { Expose } from 'class-transformer';

export class ResponseGestorDto {
  @Expose()
  id!: string;

  @Expose()
  colaboradorId!: string;

  @Expose()
  gestorId!: string;

  @Expose()
  status!: boolean;
}
