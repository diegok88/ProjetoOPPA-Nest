import { Test, TestingModule } from '@nestjs/testing';
import { ContadorCrachaController } from './contador-cracha.controller';
import { ContadorCrachaService } from './contador-cracha.service';

describe('ContadorCrachaController', () => {
  let controller: ContadorCrachaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContadorCrachaController],
      providers: [ContadorCrachaService],
    }).compile();

    controller = module.get<ContadorCrachaController>(ContadorCrachaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
