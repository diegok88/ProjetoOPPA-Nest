import { Test, TestingModule } from '@nestjs/testing';
import { ContadorCrachaService } from './contador-cracha.service';

describe('ContadorCrachaService', () => {
  let service: ContadorCrachaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ContadorCrachaService],
    }).compile();

    service = module.get<ContadorCrachaService>(ContadorCrachaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
