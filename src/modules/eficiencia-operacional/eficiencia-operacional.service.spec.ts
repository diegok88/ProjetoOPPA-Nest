import { Test, TestingModule } from '@nestjs/testing';
import { EficienciaOperacionalService } from './eficiencia-operacional.service';

describe('EficienciaOperacionalService', () => {
  let service: EficienciaOperacionalService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EficienciaOperacionalService],
    }).compile();

    service = module.get<EficienciaOperacionalService>(EficienciaOperacionalService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
