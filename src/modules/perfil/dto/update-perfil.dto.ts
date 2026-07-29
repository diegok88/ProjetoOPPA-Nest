import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreatePerfilDto } from './create-perfil.dto';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class UpdatePerfilDto extends PartialType(CreatePerfilDto) {}
