import { Test, TestingModule } from '@nestjs/testing';
import { FalhasService } from './falhas.service';

describe('FalhasService', () => {
  let service: FalhasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FalhasService],
    }).compile();

    service = module.get<FalhasService>(FalhasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
