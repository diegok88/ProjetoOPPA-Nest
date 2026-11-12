import { PartialType } from '@nestjs/mapped-types';
import { LoginColaboradorDto } from './create-auth.dto';

export class UpdateAuthDto extends PartialType(LoginColaboradorDto) {}
