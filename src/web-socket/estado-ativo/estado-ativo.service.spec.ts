import { Test, TestingModule } from '@nestjs/testing';
import { EstadoAtivoService } from './estado-ativo.service';

describe('EstadoAtivoService', () => {
  let service: EstadoAtivoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EstadoAtivoService],
    }).compile();

    service = module.get<EstadoAtivoService>(EstadoAtivoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
