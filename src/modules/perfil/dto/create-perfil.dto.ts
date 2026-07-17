import { formatUppercase } from '@/functions/dtos.function';
import { IsNotEmpty, IsString, IsUppercase, Length } from 'class-validator';

export class CreatePerfilDto {
  @IsString({ message: 'A descrição deve ser do tipo string.' })
  @IsNotEmpty({ message: 'A descrição não deve estar vazio.' })
  @Length(5, 20, {
    message:
      'A descrição deve conter no minimo 5 caracteres e no maximo 20 caracteres.',
  })
  @formatUppercase()
  descricao!: string;
}
