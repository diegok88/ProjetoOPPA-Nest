import { Test, TestingModule } from '@nestjs/testing';
import { TagAtivoService } from './tag-ativo.service';

describe('TagAtivoService', () => {
  let service: TagAtivoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TagAtivoService],
    }).compile();

    service = module.get<TagAtivoService>(TagAtivoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
