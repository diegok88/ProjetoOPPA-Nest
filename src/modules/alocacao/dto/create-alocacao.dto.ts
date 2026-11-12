import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateAlocacaoDto {
  @IsString({ message: 'Tag Ativo id não é do tipo String.' })
  @IsUUID('all', { message: 'Tag Ativo id inválido.' })
  @IsNotEmpty({ message: 'Tag Ativo é um campo obrigatório.' })
  tagAtivoId!: string;
}
