import { ResponseEmpresaDto } from '@/modules/empresa/dto/response-empresa.dto';
import { ResponsePerfilDto } from '@/modules/perfil/dto/response-perfil.dto';
import { ResponseUsuarioDto } from '@/modules/usuario/dto/response-usuario.dto';
import { OmitType, PickType } from '@nestjs/mapped-types';
import { Expose, Type } from 'class-transformer';

export class ResponseAuthDto extends OmitType(ResponseUsuarioDto, [
  'empresaId',
  'perfilId',
  'dataDesligamento',
  'senha',
  'pin',
]) {
  @Type(() => ResponsePerfilDto)
  perfil!: ResponsePerfilDto;

  @Type(() => ResponseEmpresaDto)
  empresa!: ResponseEmpresaDto;

  @Expose()
  get desEmpresa(): string {
    return this.empresa.nomeFantasia;
  }

  @Expose()
  get desPerfil(): string {
    const perfilAutenticado = `${this.perfil.descricao} - ${this.perfil.nivel}`;
    return perfilAutenticado;
  }
}

export class ResponseAuthValidateDto extends PickType(ResponseUsuarioDto, [
  'id',
  'senha',
]) {}

export class ResponseAuthMessageDto {
  @Expose()
  message!: string;
}
