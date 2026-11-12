import { CondicaoAlocacao, SituacaoAlocacao } from '@/generated/prisma/enums';
import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateAlocacaoDto {
  @IsOptional()
  @IsString({ message: 'Usuário id não é do tipo String.' })
  @IsUUID('all', { message: 'Usuário id inválido.' })
  operadorId?: string;

  @IsOptional()
  @IsEnum(SituacaoAlocacao, {
    message: 'Situação não pertence ao enum SituacaoAlocacao.',
  })
  situacao?: SituacaoAlocacao;

  @IsOptional()
  @IsEnum(CondicaoAlocacao, {
    message: 'Condição não pertence ao enum SituacaoAlocacao.',
  })
  condicao?: CondicaoAlocacao;

  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'Alocado não é do tipo Date.' })
  alocadoEm?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'Finalizado não é do tipo Date.' })
  finalizadoEm?: Date;
}
