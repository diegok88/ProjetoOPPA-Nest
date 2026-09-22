import { Test, TestingModule } from '@nestjs/testing';
import { CompetenciaOperacionalController } from './competencia-operacional.controller';
import { CompetenciaOperacionalService } from './competencia-operacional.service';

describe('CompetenciaOperacionalController', () => {
  let controller: CompetenciaOperacionalController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompetenciaOperacionalController],
      providers: [CompetenciaOperacionalService],
    }).compile();

    controller = module.get<CompetenciaOperacionalController>(CompetenciaOperacionalController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
