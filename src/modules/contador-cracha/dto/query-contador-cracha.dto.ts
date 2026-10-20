import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateContadorCrachaDto } from './create-contador-cracha.dto';
import { BlockList } from 'net';
import { IsBoolean, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class QueryContadorCrachaFilterDto extends PartialType(
  CreateContadorCrachaDto,
) {
  @IsOptional()
  @Transform(({ value }) =>
    value === undefined ? undefined : value === 'true' || value === true,
  )
  @IsBoolean({ message: 'Status não é do tipo Boolean!' })
  status?: boolean;
}
