import { PartialType } from '@nestjs/mapped-types';
import { CreateTagAtivoDto } from './create-tag-ativo.dto';

export class UpdateTagAtivoDto extends PartialType(CreateTagAtivoDto) {}
