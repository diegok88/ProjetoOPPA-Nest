import { Test, TestingModule } from '@nestjs/testing';
import { AlocacaoService } from './alocacao.service';

describe('AlocacaoService', () => {
  let service: AlocacaoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AlocacaoService],
    }).compile();

    service = module.get<AlocacaoService>(AlocacaoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
