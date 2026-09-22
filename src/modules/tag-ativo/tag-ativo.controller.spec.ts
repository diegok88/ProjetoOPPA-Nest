import { Test, TestingModule } from '@nestjs/testing';
import { TagAtivoController } from './tag-ativo.controller';
import { TagAtivoService } from './tag-ativo.service';

describe('TagAtivoController', () => {
  let controller: TagAtivoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TagAtivoController],
      providers: [TagAtivoService],
    }).compile();

    controller = module.get<TagAtivoController>(TagAtivoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
