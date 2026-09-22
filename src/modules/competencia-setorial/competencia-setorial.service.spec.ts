import { Test, TestingModule } from '@nestjs/testing';
import { CompetenciaSetorialService } from './competencia-setorial.service';

describe('CompetenciaSetorialService', () => {
  let service: CompetenciaSetorialService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CompetenciaSetorialService],
    }).compile();

    service = module.get<CompetenciaSetorialService>(CompetenciaSetorialService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
