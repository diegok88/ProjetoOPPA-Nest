import {
  CONSULTAS,
  DESVIOS,
  type ConsultaSolucoes,
  type RecorteSolucoes,
} from '@/constants/solucoes.const';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Matches,
  Max,
  Min,
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

export class QuerySolucaoAdicionalFilterDto {
  @IsOptional()
  @IsString({ message: 'O desPerfil não é do tipo String.' })
  @Length(3, 100, {
    message:
      'O desPerfil deve conter no minimo 10 caracteres e no maximo 100 caracteres.',
  })
  @Matches(/^[a-zA-ZÀ-ÿ\s]+$/, {
    message:
      'O desPerfil deve conter letras maisculas e minusculas, sem numeros e caracteres especiais.',
  })
  desPerfil!: string;
}

export class QuerySolucaoFilterDto extends QuerySolucaoAdicionalFilterDto {
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
  @IsIn(Object.keys(CONSULTAS), { message: 'Consulta não reconhecida.' })
  consulta?: ConsultaSolucoes;

  @IsOptional()
  @IsIn(Object.keys(DESVIOS), { message: 'Desvio não reconhecida.' })
  desvios?: RecorteSolucoes;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Página deve ser um número inteiro.' })
  @Min(1, { message: 'Página deve ser maior que zero.' })
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Tamanho deve ser um número inteiro.' })
  @Min(1)
  @Max(100, { message: 'Tamanho máximo é 100.' })
  size?: number = 10;
}
