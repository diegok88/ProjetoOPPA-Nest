import { Acao } from '@/generated/prisma/enums';
import { IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class UpdateAuditoriaDto {
  @IsString()
  @IsNotEmpty()
  entidade!: string;

  @IsUUID()
  @IsNotEmpty()
  registroId!: string;

  @IsEnum(Acao)
  @IsNotEmpty()
  acao!: Acao;

  @IsNotEmpty()
  antes!: any;

  @IsNotEmpty()
  depois!: any;

  @IsUUID()
  @IsNotEmpty()
  registradoPorId!: string;
}
