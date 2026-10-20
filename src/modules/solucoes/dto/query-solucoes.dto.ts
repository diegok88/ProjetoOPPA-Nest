import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Matches,
} from 'class-validator';

export class QuerySolucoesFilterDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Código não é do tipo Inteiro!' })
  @IsNumber({}, { message: 'Código não é do tipo Number!' })
  codigo?: number;

  @IsOptional()
  @IsUUID('all', { message: 'Ativo id inválida.' })
  ativoId!: string;

  @IsOptional()
  @IsUUID('all', { message: 'Falha id inválida.' })
  falhaId!: string;

  @IsOptional()
  @IsUUID('all', { message: 'Direcionamento id inválido.' })
  direcionamentoId!: string;

  @IsOptional()
  @IsString({ message: 'A descrição não é do tipo String.' })
  @Length(10, 100, {
    message:
      'A descrição deve conter no minimo 10 caracteres e no maximo 100 caracteres.',
  })
  @Matches(/^[a-zA-ZÀ-ÿ\s]+$/, {
    message:
      'A descrição deve conter letras maisculas e minusculas, sem numeros e caracteres especiais.',
  })
  descricao!: string;

  @IsOptional()
  @Transform(({ value }) =>
    value === undefined ? undefined : value === 'true' || value === true,
  )
  @IsBoolean({ message: 'Status não é do tipo Boolean!' })
  status?: boolean;

  @IsOptional()
  @IsString({ message: 'Campos não é do tipo String.' })
  campos?: string;

  @IsOptional()
  @IsString({ message: 'Include não é do tipo String.' })
  incluir?: string;
}
