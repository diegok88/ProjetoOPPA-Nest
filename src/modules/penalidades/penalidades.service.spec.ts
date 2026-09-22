import { Test, TestingModule } from '@nestjs/testing';
import { PenalidadesService } from './penalidades.service';

describe('PenalidadesService', () => {
  let service: PenalidadesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PenalidadesService],
    }).compile();

    service = module.get<PenalidadesService>(PenalidadesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
