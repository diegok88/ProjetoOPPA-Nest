import { IsUUID, IsNotEmpty } from 'class-validator';

export class CreateCompetenciaSetorialDto {
  @IsUUID('all', { message: 'Colaborador id inválido.' })
  @IsNotEmpty({ message: 'Colaborador é um campo obrigatório.' })
  colaboradorId!: string;

  @IsUUID('all', { message: 'Setor id inválido.' })
  @IsNotEmpty({ message: 'Setor é um campo obrigatório.' })
  setorId!: string;
}
