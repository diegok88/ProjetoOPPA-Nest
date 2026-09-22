import { Test, TestingModule } from '@nestjs/testing';
import { SolucoesService } from './solucoes.service';

describe('SolucoesService', () => {
  let service: SolucoesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SolucoesService],
    }).compile();

    service = module.get<SolucoesService>(SolucoesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
