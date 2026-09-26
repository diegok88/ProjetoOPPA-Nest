import { ResponseUsuarioDto } from '@/modules/usuario/dto/response-usuario.dto';
import { Usuario } from '@/modules/usuario/entities/usuario.entity';
import { PartialType } from '@nestjs/mapped-types';
import { Expose, Type } from 'class-transformer';

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

export class ResponseGestorColaboradorDto extends PartialType(
  ResponseGestorDto,
) {
  @Expose()
  @Type(() => ResponseUsuarioDto)
  colaborador?: ResponseUsuarioDto;

  @Expose()
  @Type(() => ResponseUsuarioDto)
  gestor?: ResponseUsuarioDto;
}
