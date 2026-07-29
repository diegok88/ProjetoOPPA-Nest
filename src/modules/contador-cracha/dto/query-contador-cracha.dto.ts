import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateContadorCrachaDto } from './create-contador-cracha.dto';
import { BlockList } from 'net';

export class QueryContadorCrachaFilterDto extends PartialType(
  OmitType(CreateContadorCrachaDto, ['registradoPorId']),
) {
  status?: boolean;
}
