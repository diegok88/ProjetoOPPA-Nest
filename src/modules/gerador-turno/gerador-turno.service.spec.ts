import { Test, TestingModule } from '@nestjs/testing';
import { GeradorTurnoService } from './gerador-turno.service';

describe('GeradorTurnoService', () => {
  let service: GeradorTurnoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GeradorTurnoService],
    }).compile();

    service = module.get<GeradorTurnoService>(GeradorTurnoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
