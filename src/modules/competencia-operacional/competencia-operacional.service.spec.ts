import { Test, TestingModule } from '@nestjs/testing';
import { CompetenciaOperacionalService } from './competencia-operacional.service';

describe('CompetenciaOperacionalService', () => {
  let service: CompetenciaOperacionalService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CompetenciaOperacionalService],
    }).compile();

    service = module.get<CompetenciaOperacionalService>(CompetenciaOperacionalService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
