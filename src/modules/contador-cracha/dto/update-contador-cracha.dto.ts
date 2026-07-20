import { OmitType } from '@nestjs/mapped-types';
import { CreateContadorCrachaDto } from './create-contador-cracha.dto';

export class UpdateContadorCrachaDto extends OmitType(CreateContadorCrachaDto, [
  'empresaId',
]) {}
