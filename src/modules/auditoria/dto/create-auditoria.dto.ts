import { Acao } from '@/generated/prisma/enums';
import { IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateAuditoriaDto {
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
  dadosRegistrados!: any;

  @IsUUID()
  @IsNotEmpty()
  empresaId!: string;

  @IsUUID()
  @IsNotEmpty()
  registradoPorId!: string;
}
