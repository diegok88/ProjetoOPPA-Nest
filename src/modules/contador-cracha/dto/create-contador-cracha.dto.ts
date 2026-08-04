import { IsNotEmpty, IsNumber, IsUUID, Min } from 'class-validator';

export class CreateContadorCrachaDto {
  @IsUUID('all', { message: 'Empresa com id inválido' })
  @IsNotEmpty({ message: 'Empresa é um campo obrigatório.' })
  empresaId!: string;

  @IsNumber({}, { message: 'Contador não é do tipo Number.' })
  @Min(0, { message: 'Contador não pode ser negativo.' })
  @IsNotEmpty({ message: 'Contador é um campo obrigatório.' })
  contador!: number;
}
