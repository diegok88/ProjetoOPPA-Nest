import { PartialType } from '@nestjs/mapped-types';
import { CreateFalhaDto } from './create-falha.dto';

export class UpdateFalhaDto extends PartialType(CreateFalhaDto) {}
