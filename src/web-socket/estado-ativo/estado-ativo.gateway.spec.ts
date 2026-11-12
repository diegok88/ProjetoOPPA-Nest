import { Test, TestingModule } from '@nestjs/testing';
import { EstadoAtivoGateway } from './estado-ativo.gateway';
import { EstadoAtivoService } from './estado-ativo.service';

describe('EstadoAtivoGateway', () => {
  let gateway: EstadoAtivoGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EstadoAtivoGateway, EstadoAtivoService],
    }).compile();

    gateway = module.get<EstadoAtivoGateway>(EstadoAtivoGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
