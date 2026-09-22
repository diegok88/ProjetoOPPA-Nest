import { PartialType } from '@nestjs/mapped-types';
import { CreateAlocacaoDto } from './create-alocacao.dto';

export class UpdateAlocacaoDto extends PartialType(CreateAlocacaoDto) {}
