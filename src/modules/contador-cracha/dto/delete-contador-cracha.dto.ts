import { OmitType } from '@nestjs/mapped-types';
import { CreateContadorCrachaDto } from './create-contador-cracha.dto';

export class DeleteContadorCrachaDto extends OmitType(CreateContadorCrachaDto, [
  'contador',
]) {}
