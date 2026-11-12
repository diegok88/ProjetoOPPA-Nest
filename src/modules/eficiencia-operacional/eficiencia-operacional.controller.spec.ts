import { Test, TestingModule } from '@nestjs/testing';
import { EficienciaOperacionalController } from './eficiencia-operacional.controller';
import { EficienciaOperacionalService } from './eficiencia-operacional.service';

describe('EficienciaOperacionalController', () => {
  let controller: EficienciaOperacionalController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EficienciaOperacionalController],
      providers: [EficienciaOperacionalService],
    }).compile();

    controller = module.get<EficienciaOperacionalController>(EficienciaOperacionalController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
