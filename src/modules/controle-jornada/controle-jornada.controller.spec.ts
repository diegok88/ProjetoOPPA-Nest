import { Test, TestingModule } from '@nestjs/testing';
import { ControleJornadaController } from './controle-jornada.controller';
import { ControleJornadaService } from './controle-jornada.service';

describe('ControleJornadaController', () => {
  let controller: ControleJornadaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ControleJornadaController],
      providers: [ControleJornadaService],
    }).compile();

    controller = module.get<ControleJornadaController>(ControleJornadaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
