import { Expose } from 'class-transformer';

export class ResponseAuditoriaUsuarioCreateDto {
  @Expose()
  cracha!: number;

  @Expose()
  nome!: string;

  @Expose()
  dataNascimento!: Date;

  @Expose()
  dataAdmissao!: Date;

  @Expose()
  senha!: string;

  @Expose()
  pin!: string;

  @Expose()
  perfil!: string;

  @Expose()
  escala!: string;

  @Expose()
  turno!: string;

  @Expose()
  empresa!: string;

  @Expose()
  status!: boolean;
}
