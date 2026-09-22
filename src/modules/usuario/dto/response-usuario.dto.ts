import { ResponseEmpresaDto } from '@/modules/empresa/dto/response-empresa.dto';
import { ResponsePerfilDto } from '@/modules/perfil/dto/response-perfil.dto';
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
  dataNascimento!: Date;

  @Expose()
  dataAdmissao!: Date;

  @Expose()
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

export class ResponseUsuarioGestorDto {
  @Expose() nome?: string | null;
  @Expose() cracha?: number | null;
}

export class ResponseUsuarioAssistDto extends PartialType(ResponseUsuarioDto) {
  @Type(() => ResponsePerfilDto)
  perfil?: ResponsePerfilDto;

  @Expose()
  get desPerfil(): string | null {
    return this.perfil?.descricao || null;
  }

  @Type(() => ResponseEmpresaDto)
  empresa?: ResponseEmpresaDto;

  @Expose()
  get desEmpresa(): string | null {
    return this.empresa?.nomeFantasia || null;
  }

  @Type(() => ResponseUsuarioGestorDto)
  gestor?: ResponseUsuarioGestorDto;

  @Expose()
  get nomeGestor(): string | null {
    return this.gestor?.nome || null;
  }

  @Expose()
  get crachaGestor(): number | null {
    return this.gestor?.cracha || null;
  }
}
