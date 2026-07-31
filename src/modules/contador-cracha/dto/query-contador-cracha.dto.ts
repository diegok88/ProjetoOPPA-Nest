import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateContadorCrachaDto } from './create-contador-cracha.dto';
import { BlockList } from 'net';
import { IsBoolean, IsOptional } from 'class-validator';

export class QueryContadorCrachaFilterDto extends PartialType(
  OmitType(CreateContadorCrachaDto, ['registradoPorId']),
) {
  @IsOptional()
  @IsBoolean({ message: 'Status não é do tipo Boolean!' })
  status?: boolean;
}
