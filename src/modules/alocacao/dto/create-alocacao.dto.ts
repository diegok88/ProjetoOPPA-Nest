import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateAlocacaoDto {
  @IsString({ message: 'Usuário id não é do tipo String.' })
  @IsUUID('all', { message: 'Usuário id inválido.' })
  @IsNotEmpty({ message: 'Usuário é um campo obrigatório.' })
  operadorId!: string;

  @IsString({ message: 'Tag Ativo id não é do tipo String.' })
  @IsUUID('all', { message: 'Tag Ativo id inválido.' })
  @IsNotEmpty({ message: 'Tag Ativo é um campo obrigatório.' })
  tagAtivoId!: string;
}
