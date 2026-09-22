import { IsUUID, IsNotEmpty } from 'class-validator';

export class CreateCompetenciaOperacionalDto {
  @IsUUID('all', { message: 'Operador id inválido.' })
  @IsNotEmpty({ message: 'O operador é um campo obrigatório.' })
  operadorId!: string;

  @IsUUID('all', { message: 'Ativo id inválido.' })
  @IsNotEmpty({ message: 'O ativo é um campo obrigatório.' })
  ativoId!: string;
}
