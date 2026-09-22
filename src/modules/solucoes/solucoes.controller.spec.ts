import { Test, TestingModule } from '@nestjs/testing';
import { SolucoesController } from './solucoes.controller';
import { SolucoesService } from './solucoes.service';

describe('SolucoesController', () => {
  let controller: SolucoesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SolucoesController],
      providers: [SolucoesService],
    }).compile();

    controller = module.get<SolucoesController>(SolucoesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
