import { Test, TestingModule } from '@nestjs/testing';
import { CompetenciaSetorialController } from './competencia-setorial.controller';
import { CompetenciaSetorialService } from './competencia-setorial.service';

describe('CompetenciaSetorialController', () => {
  let controller: CompetenciaSetorialController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompetenciaSetorialController],
      providers: [CompetenciaSetorialService],
    }).compile();

    controller = module.get<CompetenciaSetorialController>(CompetenciaSetorialController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
