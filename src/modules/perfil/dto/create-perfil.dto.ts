import { formatUppercase } from '@/utils/format-uppercase.util';
import {
  IsNotEmpty,
  IsString,
  IsUppercase,
  IsUUID,
  Length,
} from 'class-validator';

export class CreatePerfilDto {
  @IsString({ message: 'A descrição deve ser do tipo string.' })
  @IsNotEmpty({ message: 'A descrição não deve estar vazio.' })
  @Length(5, 50, {
    message:
      'A descrição deve conter no minimo 5 caracteres e no maximo 50 caracteres.',
  })
  @formatUppercase()
  descricao!: string;

  @IsUUID('all', { message: 'Empresa id inválido.' })
  @IsNotEmpty({ message: 'Empresa é um campo obrigatório.' })
  empresaId!: string;

  @IsUUID('all', { message: 'Usuário id inválido.' })
  @IsNotEmpty({ message: 'Usuário é um campo obrigatório.' })
  registradoPorId!: string;
}
