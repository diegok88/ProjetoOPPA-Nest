import { PickType } from '@nestjs/mapped-types';
import { Exclude, Expose, Type } from 'class-transformer';

/* RETORNO PARCIAL DO PERFIL */
export class ResponsePerfilParcialDto {
  @Expose()
  descricao!: string | null;

  @Expose()
  nivel!: string | null;
}

/* RETORNO PARCIAL DO EMPRESA */
export class ResponseEmpresaParcialDto {
  @Expose()
  razaoSocial!: string | null;
}

/* RESUMO DO GESTOR DENTRO DO VÍNCULO (nome e crachá, sem id no select) */
export class ResponseUsuarioGestorParcialDto {
  @Expose()
  cracha!: number | null;

  @Expose()
  nome!: string | null;
}

/* CADA ITEM DA LISTA gestorComoColaborador */
export class ResponseGestorVinculoDto {
  @Expose()
  id!: string;

  @Expose()
  @Type(() => ResponseUsuarioGestorParcialDto)
  gestor?: ResponseUsuarioGestorParcialDto;
}

/* RETORNO DO USUARIO */
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

  @Expose()
  versaoToken!: number;

  @Expose()
  @Type(() => ResponsePerfilParcialDto)
  perfil?: ResponsePerfilParcialDto;

  @Expose()
  @Type(() => ResponseEmpresaParcialDto)
  empresa?: ResponseEmpresaParcialDto;
}

/* DTO PARA CONSULTA UNICA: aplicado para a requisição findOne() */
export class ResponseUsuarioRelacaoDto extends ResponseUsuarioDto {
  @Expose()
  @Type(() => ResponseGestorVinculoDto)
  gestorComoColaborador?: ResponseGestorVinculoDto[];
}

/* DTO DE RETORNO DE UMA LISTA: apenas aplicado para a listagem no front */
export class ResponseUsuarioListDto extends PickType(ResponseUsuarioDto, [
  'id',
  'cracha',
  'nome',
] as const) {}

/* DTO DO CONTADOR: retorna total, ativos e inativos */
export class ResponseUsuarioContadorDto {
  @Expose()
  total!: number;

  @Expose()
  ativos!: number;

  @Expose()
  inativos!: number;
}
