import { PartialType } from '@nestjs/mapped-types';
import { CreateGestorDto } from './create-gestor.dto';

export class UpdateGestorDto extends PartialType(CreateGestorDto) {}
