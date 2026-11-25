import { Test, TestingModule } from '@nestjs/testing';
import { SolicitacoesGateway } from './solicitacoes.gateway';
import { SolicitacoesService } from './solicitacoes.service';

describe('SolicitacoesGateway', () => {
  let gateway: SolicitacoesGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SolicitacoesGateway, SolicitacoesService],
    }).compile();

    gateway = module.get<SolicitacoesGateway>(SolicitacoesGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
