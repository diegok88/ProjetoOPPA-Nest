import { Test, TestingModule } from '@nestjs/testing';
import { GeradorEscalaController } from './gerador-escala.controller';
import { GeradorEscalaService } from './gerador-escala.service';

describe('GeradorEscalaController', () => {
  let controller: GeradorEscalaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GeradorEscalaController],
      providers: [GeradorEscalaService],
    }).compile();

    controller = module.get<GeradorEscalaController>(GeradorEscalaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
