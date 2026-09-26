import { Empresa } from '@/modules/empresa/entities/empresa.entity';
import { Perfil } from '@/modules/perfil/entities/perfil.entity';
import { PickType } from '@nestjs/mapped-types';
import { Exclude, Expose, Type } from 'class-transformer';

export class ResponseUsuarioGestorDto {
  @Expose() nome?: string | null;
  @Expose() cracha?: number | null;
}

export class ResponseUsuarioVinculoGestorDto {
  @Type(() => ResponseUsuarioGestorDto)
  gestor?: ResponseUsuarioGestorDto;
}

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

  @Type(() => Perfil)
  perfil?: Perfil;

  @Expose()
  get desPerfil(): string | null {
    return this.perfil?.descricao || null;
  }

  @Type(() => Empresa)
  empresa?: Empresa;

  @Expose()
  get desEmpresa(): string | null {
    return this.empresa?.razaoSocial || null;
  }

  @Type(() => ResponseUsuarioVinculoGestorDto)
  gestorComoColaborador?: ResponseUsuarioVinculoGestorDto[];

  @Expose()
  get nomeGestor(): string | null {
    return this.gestorComoColaborador?.[0]?.gestor?.nome ?? null;
  }

  @Expose()
  get crachaGestor(): number | null {
    return this.gestorComoColaborador?.[0]?.gestor?.cracha ?? null;
  }
}

export class ResponseUsuarioListDto extends PickType(ResponseUsuarioDto, [
  'id',
  'cracha',
  'nome',
] as const) {}

export class ResponseUsuarioContadorDto {
  @Expose()
  total!: number;

  @Expose()
  ativos!: number;

  @Expose()
  inativos!: number;
}
