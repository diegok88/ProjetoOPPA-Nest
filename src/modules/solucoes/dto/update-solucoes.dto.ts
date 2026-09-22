import { PartialType } from '@nestjs/mapped-types';
import { CreateSolucoesDto } from './create-solucoes.dto';

export class UpdateSolucoeDto extends PartialType(CreateSolucoesDto) {}
