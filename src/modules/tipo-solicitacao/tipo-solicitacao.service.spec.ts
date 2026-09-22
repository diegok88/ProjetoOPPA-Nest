import { Test, TestingModule } from '@nestjs/testing';
import { TipoSolicitacaoService } from './tipo-solicitacao.service';

describe('TipoSolicitacaoService', () => {
  let service: TipoSolicitacaoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TipoSolicitacaoService],
    }).compile();

    service = module.get<TipoSolicitacaoService>(TipoSolicitacaoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
