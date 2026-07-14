import { IsNotEmpty, IsString, IsUppercase } from 'class-validator';

export class CreatePerfilDto {
  @IsString()
  @IsNotEmpty({ message: 'O campo está vazio' })
  @IsUppercase({ message: 'A descrição deve ser em letra maiúscula.' })
  descricao!: string;
}
