import { TipoTurno } from '@/generated/prisma/enums';
import { formatarDataHoraBrasilia } from '@/utils/data-brasilia.util';
import { Expose, Transform, Type } from 'class-transformer';

export class ResponseControleJornadaUsuarioDto {
  @Expose() id!: string;
  @Expose() cracha!: number;
  @Expose() nome!: string;
  @Expose() turno!: TipoTurno;
}

export class ResponseControleJornadaDto {
  @Expose() id!: string;
  @Expose() usuarioId!: string;
  @Expose() tipoJornada!: string;
  @Expose() estadoJornada!: string;
  @Expose() dataRegistro!: Date;
  @Expose() tagAtivoId!: string;
  @Expose() status!: boolean;

  @Expose()
  @Transform(({ obj }) =>
    obj.dataRegistro ? formatarDataHoraBrasilia(obj.dataRegistro) : null,
  )
  dataRegistroBrasilia?: string;
}

export class ResponseControleJornadaRelacaoDto extends ResponseControleJornadaDto {
  @Expose()
  @Type(() => ResponseControleJornadaUsuarioDto)
  usuario!: ResponseControleJornadaUsuarioDto;
}

export class ResponseControleJornadaPaginadaDto {
  @Expose()
  @Type(() => ResponseControleJornadaRelacaoDto)
  dados!: ResponseControleJornadaRelacaoDto[];

  @Expose() total!: number;
  @Expose() pagina!: number;
  @Expose() tamanho!: number;
}
