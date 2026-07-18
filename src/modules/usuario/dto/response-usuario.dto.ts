import { ResponseEmpresaDto } from '@/modules/empresa/dto/response-empresa.dto';
import { ResponsePerfilDto } from '@/modules/perfil/dto/response-perfil.dto';
import { FormatDate } from '@/utils/fromat-date.util';
import { ReturnObjectPerfil, ReturnObjectEmpresa } from '@/utils/return-object.util';
import { Expose, Type } from 'class-transformer';

export class ResponseUsuarioDto {
  @Expose()
  id!: string;

  @Expose()
  cracha!: number;

  @Expose()
  nome!: string;

  @Expose()
  @FormatDate()
  dataNascimento!: Date;

  @Expose()
  @FormatDate()
  dataAdmissao!: Date;

  @Expose()
  @FormatDate()
  dataDesligamento?: Date | null;

  @Expose()
  senha!: string;

  @Expose()
  pin!: string;

  @Expose()
  perfilId!: string;

  @Expose()
  turno!: string;

  @Expose()
  escala!: string;

  @Expose()
  empresaId!: string;

  @Expose()
  status!: boolean;

  @Expose()
  @Type(() => ResponsePerfilDto)
  perfil?: ResponsePerfilDto;

  @Expose()
  @Type(() => ResponseEmpresaDto) // RETORNA O DADOS DA CLASSE RELACIONADA
  empresa?: ResponseEmpresaDto;

  @Expose()
  @ReturnObjectPerfil()
  descPerfil?: string;

  @Expose()
  @ReturnObjectEmpresa()
  nomeEmpresa?: string;
}
