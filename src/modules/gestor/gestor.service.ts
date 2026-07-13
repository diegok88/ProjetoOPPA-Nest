import { Injectable } from '@nestjs/common';
import { CreateGestorDto } from './dto/create-gestor.dto';
import { UpdateGestorDto } from './dto/update-gestor.dto';

@Injectable()
export class GestorService {
  create(createGestorDto: CreateGestorDto) {
    return 'This action adds a new gestor';
  }

  findAll() {
    return `This action returns all gestor`;
  }

  findOne(id: number) {
    return `This action returns a #${id} gestor`;
  }

  update(id: number, updateGestorDto: UpdateGestorDto) {
    return `This action updates a #${id} gestor`;
  }

  remove(id: number) {
    return `This action removes a #${id} gestor`;
  }
}
