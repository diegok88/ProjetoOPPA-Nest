import { ResponseEmpresaDto } from '@/modules/empresa/dto/response-empresa.dto';
import { ResponsePerfilDto } from '@/modules/perfil/dto/response-perfil.dto';
import { FormatDate } from '@/utils/fromat-date.util';
import { PartialType } from '@nestjs/mapped-types';
import { Exclude, Expose, Type } from 'class-transformer';

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

  @Exclude()
  senha!: string;

  @Exclude()
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
}

export class ResponseUsuarioAssistDto extends PartialType(ResponseUsuarioDto) {
  @Type(() => ResponsePerfilDto)
  perfil?: ResponsePerfilDto;

  @Type(() => ResponseEmpresaDto)
  empresa?: ResponseEmpresaDto;

  @Expose()
  get desPerfil(): string | null {
    return this.perfil?.descricao || null;
  }

  @Expose()
  get desEmpresa(): string | null {
    return this.empresa?.nomeFantasia || null;
  }
}
