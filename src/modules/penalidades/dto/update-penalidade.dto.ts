import { PartialType } from '@nestjs/mapped-types';
import { CreatePenalidadeDto } from './create-penalidade.dto';

export class UpdatePenalidadeDto extends PartialType(CreatePenalidadeDto) {}
