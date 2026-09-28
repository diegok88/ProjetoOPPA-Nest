import {
  ResponseUsuarioDto,
  ResponseUsuarioGestorParcialDto,
} from '@/modules/usuario/dto/response-usuario.dto';
import { Expose, Type } from 'class-transformer';

/* RETORNO DOS DADOS DO GESTOR */
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

/* RETORNO DOS DADOS DO USUARIO ATRAVES DA RELAÇÃO DOS IDS gestorId E colaboradorId */
export class ResponseGestorRelacoesDto extends ResponseGestorDto {
  @Expose()
  @Type(() => ResponseUsuarioDto)
  colaborador?: ResponseUsuarioDto;

  @Expose()
  @Type(() => ResponseUsuarioDto)
  gestor?: ResponseUsuarioDto;
}

/* AS DUAS RELAÇÕES PARCIAIS (corrigi o typo "Pacial" para "Parcial") */
export class ResponseGestorRelacoesParcialDto extends ResponseGestorDto {
  @Expose()
  @Type(() => ResponseUsuarioGestorParcialDto)
  colaborador?: ResponseUsuarioGestorParcialDto;

  @Expose()
  @Type(() => ResponseUsuarioGestorParcialDto)
  gestor?: ResponseUsuarioGestorParcialDto;
}

/* A ROTA findOneUser: colaborador completo, gestor parcial */
export class ResponseGestorUsuarioDto extends ResponseGestorDto {
  @Expose()
  @Type(() => ResponseUsuarioDto)
  colaborador?: ResponseUsuarioDto;

  @Expose()
  @Type(() => ResponseUsuarioGestorParcialDto)
  gestor?: ResponseUsuarioGestorParcialDto;
}
