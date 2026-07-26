import { OmitType } from '@nestjs/mapped-types';
import { CreatePerfilDto } from './create-perfil.dto';

export class DeletePerfilDto extends OmitType(CreatePerfilDto, ['descricao']) {}
