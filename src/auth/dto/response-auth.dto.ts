import { CreateUsuarioDto } from '@/modules/usuario/dto/create-usuario.dto';
import { ResponseUsuarioDto } from '@/modules/usuario/dto/response-usuario.dto';
import { OmitType, PickType } from '@nestjs/mapped-types';

export class ResponseAuthDto extends OmitType(ResponseUsuarioDto, [
  'id',
  'dataDesligamento',
  'senha',
  'pin',
  'status',
]) {}

export class ResponseAuthValidateDto extends PickType(ResponseUsuarioDto, [
  'id',
  'senha',
]) {}
