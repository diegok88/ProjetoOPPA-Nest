import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class QuerySetoresDto { 
  @IsOptional()
  @IsNumber({}, { message: 'Código não é do tipo Number' })
  codigo?: number;

  @IsOptional()
  @IsString({ message: 'Descrição não é do tipo String.' })
  descricao?: string;

  @IsOptional()
  @IsUUID('all', { message: 'Empresa id inválido.' })
  empresaId?: string;

  @IsOptional()
  @IsBoolean({ message: 'Status não é do tipo Boolean!' })
  status?: boolean;

  @IsOptional()
  @IsString({ message: 'Campos não é do tipo String.' })
  campos?: string;
}
