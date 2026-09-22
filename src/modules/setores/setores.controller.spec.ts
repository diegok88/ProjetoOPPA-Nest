import { Test, TestingModule } from '@nestjs/testing';
import { SetoresController } from './setores.controller';
import { SetoresService } from './setores.service';

describe('SetoresController', () => {
  let controller: SetoresController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SetoresController],
      providers: [SetoresService],
    }).compile();

    controller = module.get<SetoresController>(SetoresController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
