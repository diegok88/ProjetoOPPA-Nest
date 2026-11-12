import { Test, TestingModule } from '@nestjs/testing';
import { GeradorEscalaService } from './gerador-escala.service';

describe('GeradorEscalaService', () => {
  let service: GeradorEscalaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GeradorEscalaService],
    }).compile();

    service = module.get<GeradorEscalaService>(GeradorEscalaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
