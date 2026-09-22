import { Test, TestingModule } from '@nestjs/testing';
import { AlocacaoController } from './alocacao.controller';
import { AlocacaoService } from './alocacao.service';

describe('AlocacaoController', () => {
  let controller: AlocacaoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AlocacaoController],
      providers: [AlocacaoService],
    }).compile();

    controller = module.get<AlocacaoController>(AlocacaoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
