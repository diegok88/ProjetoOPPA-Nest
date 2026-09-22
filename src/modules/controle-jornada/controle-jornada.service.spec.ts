import { Test, TestingModule } from '@nestjs/testing';
import { ControleJornadaService } from './controle-jornada.service';

describe('ControleJornadaService', () => {
  let service: ControleJornadaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ControleJornadaService],
    }).compile();

    service = module.get<ControleJornadaService>(ControleJornadaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
