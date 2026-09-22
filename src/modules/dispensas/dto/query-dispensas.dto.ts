import { PartialType } from '@nestjs/mapped-types';
import { CreateDispensaDto } from './create-dispensa.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class QueryDispensaFilterDto extends PartialType(CreateDispensaDto) {
  @IsOptional()
  @IsBoolean({ message: 'Status não é do tipo Boolean!' })
  status?: boolean;
}
