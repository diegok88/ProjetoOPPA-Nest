import { Test, TestingModule } from '@nestjs/testing';
import { TipoSolicitacaoController } from './tipo-solicitacao.controller';
import { TipoSolicitacaoService } from './tipo-solicitacao.service';

describe('TipoSolicitacaoController', () => {
  let controller: TipoSolicitacaoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TipoSolicitacaoController],
      providers: [TipoSolicitacaoService],
    }).compile();

    controller = module.get<TipoSolicitacaoController>(TipoSolicitacaoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
