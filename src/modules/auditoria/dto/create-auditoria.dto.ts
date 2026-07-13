import { Acao } from '@/generated/prisma/enums';
import { IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateAuditoriaDto {
  @IsUUID()
  @IsNotEmpty()
  registradoPorId!: string;

  @IsString()
  @IsNotEmpty()
  entidade!: string;

  @IsEnum(Acao)
  @IsNotEmpty()
  acao!: Acao;

  @IsNotEmpty()
  dadosRegistrados!: unknown;
}
