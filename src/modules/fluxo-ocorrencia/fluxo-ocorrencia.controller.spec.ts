import { Test, TestingModule } from '@nestjs/testing';
import { FluxoOcorrenciaController } from './fluxo-ocorrencia.controller';
import { FluxoOcorrenciaService } from './fluxo-ocorrencia.service';

describe('FluxoOcorrenciaController', () => {
  let controller: FluxoOcorrenciaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FluxoOcorrenciaController],
      providers: [FluxoOcorrenciaService],
    }).compile();

    controller = module.get<FluxoOcorrenciaController>(FluxoOcorrenciaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
