import { Test, TestingModule } from '@nestjs/testing';
import { FluxoOcorrenciaService } from './fluxo-ocorrencia.service';

describe('FluxoOcorrenciaService', () => {
  let service: FluxoOcorrenciaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FluxoOcorrenciaService],
    }).compile();

    service = module.get<FluxoOcorrenciaService>(FluxoOcorrenciaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
