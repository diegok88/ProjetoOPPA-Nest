import { PartialType } from '@nestjs/mapped-types';
import { CreateAlocacaoDto } from './create-alocacao.dto';
import { IsBoolean, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { CondicaoAlocacao } from '@/generated/prisma/enums';

export class QueryAlocacaoFilterDto extends PartialType(CreateAlocacaoDto) {
  @IsOptional()
  @IsUUID('all', { message: 'Gestor id inválido.' })
  gestorId?: string;

  @IsOptional()
  @IsEnum(CondicaoAlocacao, {
    message: 'Condição não pertence ao enum CondicaoAlocacao.',
  })
  condicao?: CondicaoAlocacao;

  @IsOptional()
  @IsBoolean({ message: 'Status não é do tipo Boolean!' })
  status?: boolean;
}
