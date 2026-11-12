import { TipoEstadoAtivo } from '@/generated/prisma/enums';
import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateEstadoAtivoDto {
  @IsString({ message: 'Ordenação não é do tipo String.' })
  @IsNotEmpty({ message: 'Cliente Id é obrigatório' })
  @Transform(({ value }) => value.toUpperCase())
  tagAtivo?: string;

  @IsEnum(TipoEstadoAtivo, {
    message: 'Tipo Estado não pertence ao enum TipoEstadoAtivo.',
  })
  @IsNotEmpty({ message: 'Tipo Estado obrigatório' })
  tipoEstado!: TipoEstadoAtivo;
}

export class CreateClienteDto {
  @IsUUID('all', { message: 'Cliente Id inválido.' })
  @IsNotEmpty({ message: 'Cliente Id é obrigatório' })
  clientId!: string;

  @IsUUID('all', { message: 'Perfil Id não é do tipo string.' })
  @IsNotEmpty({ message: 'Perfil Id é obrigatório' })
  perfilId!: string;
}
