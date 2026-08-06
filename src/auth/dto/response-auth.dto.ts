import { ResponseUsuarioDto } from '@/modules/usuario/dto/response-usuario.dto';
import { OmitType, PickType } from '@nestjs/mapped-types';

export class ResponseAuthDto extends OmitType(ResponseUsuarioDto, [
  'dataDesligamento',
  'senha',
  'pin',
]) {}

export class ResponseAuthValidateDto extends PickType(ResponseUsuarioDto, [
  'id',
  'senha',
]) {}

export class ResponseAuthMessageDto {
  message!: string;
}
