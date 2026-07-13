import { Test, TestingModule } from '@nestjs/testing';
import { GestorService } from './gestor.service';

describe('GestorService', () => {
  let service: GestorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GestorService],
    }).compile();

    service = module.get<GestorService>(GestorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
