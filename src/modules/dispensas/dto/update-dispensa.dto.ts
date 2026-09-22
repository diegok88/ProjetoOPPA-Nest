import { PartialType } from '@nestjs/mapped-types';
import { CreateDispensaDto } from './create-dispensa.dto';

export class UpdateDispensaDto extends PartialType(CreateDispensaDto) {}
