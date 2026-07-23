import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateContadorCrachaDto } from './create-contador-cracha.dto';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class UpdateContadorCrachaDto extends OmitType(CreateContadorCrachaDto, [
  'contador',
]) {}
