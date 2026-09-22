import { Injectable } from '@nestjs/common';
import { CreateCompetenciaSetorialDto } from './dto/create-competencia-setorial.dto';
import { UpdateCompetenciaSetorialDto } from './dto/update-competencia-setorial.dto';

@Injectable()
export class CompetenciaSetorialService {
  create(createCompetenciaSetorialDto: CreateCompetenciaSetorialDto) {
    return 'This action adds a new competenciaSetorial';
  }

  findAll() {
    return `This action returns all competenciaSetorial`;
  }

  findOne(id: number) {
    return `This action returns a #${id} competenciaSetorial`;
  }

  update(id: number, updateCompetenciaSetorialDto: UpdateCompetenciaSetorialDto) {
    return `This action updates a #${id} competenciaSetorial`;
  }

  remove(id: number) {
    return `This action removes a #${id} competenciaSetorial`;
  }
}
