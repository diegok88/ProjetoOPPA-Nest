import { OmitType } from '@nestjs/mapped-types';
import { IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { CreateAuditoriaDto } from './create-auditoria.dto';

export class UpdateAuditoriaDto extends OmitType(CreateAuditoriaDto, [
  'dadosRegistrados',
]) {
  @IsNotEmpty()
  antes!: any;

  @IsNotEmpty()
  depois!: any;
}
