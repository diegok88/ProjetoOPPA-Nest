import { PartialType } from '@nestjs/mapped-types';
import { CreateSetoresDto } from './create-setores.dto';

export class UpdateSetoresDto extends PartialType(CreateSetoresDto) {}
