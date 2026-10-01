import { Expose } from 'class-transformer';

export class ResponseCompetenciaSetorialDto {
  @Expose()
  id!: string;

  @Expose()
  usuarioId!: string;

  @Expose()
  gestorId!: string;

  @Expose()
  setorId!: string;

  @Expose()
  status!: string;
}
