import { Expose } from 'class-transformer';

export class ResponseControleJornadaDto {
  @Expose() id!: string;
  @Expose() usuarioId!: string;
  @Expose() tipoJornada!: string;
  @Expose() estadoJornada!: string;
  @Expose() dataRegistro!: Date;
  @Expose() tagAtivoId!: string;
  @Expose() status!: boolean;
}
