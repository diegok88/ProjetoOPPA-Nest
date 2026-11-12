import { Injectable } from '@nestjs/common';
import { CreateEficienciaOperacionalDto } from './dto/create-eficiencia-operacional.dto';
import { UpdateEficienciaOperacionalDto } from './dto/update-eficiencia-operacional.dto';

@Injectable()
export class EficienciaOperacionalService {
  create(createEficienciaOperacionalDto: CreateEficienciaOperacionalDto) {
    return 'This action adds a new eficienciaOperacional';
  }

  findAll() {
    return `This action returns all eficienciaOperacional`;
  }

  findOne(id: number) {
    return `This action returns a #${id} eficienciaOperacional`;
  }

  update(id: number, updateEficienciaOperacionalDto: UpdateEficienciaOperacionalDto) {
    return `This action updates a #${id} eficienciaOperacional`;
  }

  remove(id: number) {
    return `This action removes a #${id} eficienciaOperacional`;
  }
}
