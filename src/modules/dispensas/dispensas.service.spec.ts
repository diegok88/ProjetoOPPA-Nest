import { Test, TestingModule } from '@nestjs/testing';
import { DispensasService } from './dispensas.service';

describe('DispensasService', () => {
  let service: DispensasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DispensasService],
    }).compile();

    service = module.get<DispensasService>(DispensasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
