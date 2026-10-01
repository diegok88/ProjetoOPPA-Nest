import { ResponseUsuarioDto } from '@/modules/usuario/dto/response-usuario.dto';
import { Usuario } from '@/modules/usuario/entities/usuario.entity';
import { FormatCep } from '@/utils/format-cep.util';
import { FormatCNPJ } from '@/utils/format-cnpj.util';
import { FormatFone } from '@/utils/format-fone.util';
import { OmitType, PickType } from '@nestjs/mapped-types';
import { Expose, Type } from 'class-transformer';

export class ResponseEmpresaContadorCrachaDto {
  @Expose()
  id!: string;

  @Expose()
  contador!: number;
}

export class ResponseEmpresaDto {
  @Expose()
  id!: string;

  @Expose()
  codigo!: number;

  @Expose()
  cnpj!: string;

  @Expose()
  razaoSocial!: string;

  @Expose()
  nomeFantasia!: string;

  @Expose()
  contato!: string;

  @Expose()
  email!: string;

  @Expose()
  rua!: string;

  @Expose()
  numero!: string;

  @Expose()
  bairro!: string;

  @Expose()
  cidade!: string;

  @Expose()
  estado!: string;

  @Expose()
  cep!: string;

  @Expose()
  status!: boolean;

  @Type(() => ResponseUsuarioDto)
  usuario?: Usuario[];

  @Expose()
  get desNome(): string[] {
    return (
      this.usuario?.map((u) => u.nome).filter((n): n is string => n !== null) ??
      []
    );
  }

  @Expose()
  @Type(() => ResponseEmpresaContadorCrachaDto)
  contadorCracha?: ResponseEmpresaContadorCrachaDto;
}

export class ResponseEmpresaListDto extends PickType(ResponseEmpresaDto, [
  'id',
  'codigo',
  'razaoSocial',
]) {}

export class ResponseEmpresaContadorDto {
  @Expose()
  total!: number;

  @Expose()
  ativos!: number;

  @Expose()
  inativos!: number;
}

export class ResponseEmpresaAdminDto extends OmitType(ResponseEmpresaDto, [
  'cnpj',
  'contato',
  'cep',
]) {
  @Expose()
  @FormatCNPJ()
  cnpj!: string;

  @Expose()
  @FormatFone()
  contato!: string;

  @Expose()
  @FormatCep()
  cep!: string;
}

export class ResponseEmpresaMessageDto {
  @Expose()
  message!: string;
}
