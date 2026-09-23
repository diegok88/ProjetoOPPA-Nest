import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateSetoresDto {
  @IsString({ message: 'A descrição deve ser do tipo string.' })
  @IsNotEmpty({ message: 'A descrição não deve estar vazio.' })
  @Length(5, 50, {
    message:
      'A descrição deve conter no minimo 5 caracteres e no maximo 50 caracteres.',
  })
  @Transform(({ value }) => value.toUpperCase())
  descricao!: string;
}
