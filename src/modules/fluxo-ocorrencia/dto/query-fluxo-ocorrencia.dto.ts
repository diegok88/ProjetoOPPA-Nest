import {
  IsBoolean,
  IsDate,
  IsIn,
  IsInt,
  IsOptional,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import {
  fimDoDiaBrasilia,
  inicioDoDiaBrasilia,
} from '@/utils/data-brasilia.util';
import {
  CONSULTAS,
  DESVIOS,
  type ConsultaFluxoOcorrencia,
  type RecorteFluxoOcorrencia,
} from '@/constants/query-fluxo-ocorrencia.const';

export class QueryFluxoOcorrenciaFilterDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Código deve ser um número inteiro.' })
  @Min(1, { message: 'Código deve ser maior que zero.' })
  codigo?: number;

  @IsOptional()
  @IsUUID('all', { message: 'Ocorrência id inválida.' })
  ocorrenciaId?: string;

  @IsOptional()
  @IsUUID('all', { message: 'Usuário perfil id inválida.' })
  usuarioId?: string;

  @IsOptional()
  @IsUUID('all', { message: 'Tansferido perfil id inválida.' })
  transferidoPerfilId?: string;

  @IsOptional()
  @Transform(({ value }) => inicioDoDiaBrasilia(value))
  @IsDate({ message: 'DataInicial não está em formato de data válido!' })
  dataInicial?: Date;

  @IsOptional()
  @Transform(({ value }) => fimDoDiaBrasilia(value))
  @IsDate({ message: 'DataFinal não está em formato de data válido!' })
  dataFinal?: Date;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Código deve ser um número inteiro.' })
  @Min(1, { message: 'Código deve ser maior que zero.' })
  duracao?: number;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  @IsBoolean({ message: 'Status não é do tipo Boolean!' })
  status?: boolean;

  /* Condições de retorno dos dados */
  @IsOptional()
  @IsIn(Object.keys(CONSULTAS), { message: 'Consulta não reconhecida.' })
  consulta?: ConsultaFluxoOcorrencia;

  @IsOptional()
  @IsIn(Object.keys(DESVIOS), { message: 'Desvio não reconhecida.' })
  desvios?: RecorteFluxoOcorrencia;

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
