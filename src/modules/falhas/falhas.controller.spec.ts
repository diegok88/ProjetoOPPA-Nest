import { Test, TestingModule } from '@nestjs/testing';
import { FalhasController } from './falhas.controller';
import { FalhasService } from './falhas.service';

describe('FalhasController', () => {
  let controller: FalhasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FalhasController],
      providers: [FalhasService],
    }).compile();

    controller = module.get<FalhasController>(FalhasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
